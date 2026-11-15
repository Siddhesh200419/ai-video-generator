import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { GenerateImageScript } from "@/config/AiModel";
import { inngest } from "@/inngest/client";
import { createClient } from "@deepgram/sdk";
import { and, asc, eq, lt } from "drizzle-orm";
import { NonRetriableError } from "inngest";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadFile } from "@/lib/storage";
import { geminiAudioToWav } from "@/lib/pcmToWav";
import { buildSpeechPart, resolveVoice } from "@/lib/voiceDirection";
import {
  activeVideoJob,
  failVideoJob,
  expireVideoJobs,
  videoJobEvent,
  RENDER_TIMEOUT_MS,
  DISPATCH_TIMEOUT_MS,
  JOB_TIMEOUT_MS,
} from "@/lib/videoJobs";
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

/* -------------------------------------------------------------------------- */
/*                             RESILIENCE HELPERS                             */
/* -------------------------------------------------------------------------- */

/**
 * Runs `mapper` over `items` with at most `limit` tasks in flight at once.
 * Order is preserved. Stops the pipeline from firing every scene image at the
 * provider the moment the prompt step resolves, which trips rate limits once a
 * script produces many scenes.
 */
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  const maxWorkers = Math.max(1, Math.min(limit, items.length));
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: maxWorkers }, worker));
  return results;
}

/**
 * Retries an async task with linear backoff. Used around paid AI calls so a
 * transient 429/5xx does not fail the whole Inngest step — which would re-run
 * every sibling call inside it and re-spend on all of them.
 */
async function withRetry(
  fn,
  { attempts = 3, baseDelayMs = 1000, label = "task" } = {}
) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(
        `[${label}] attempt ${attempt}/${attempts} failed:`,
        error?.message || error
      );
      if (attempt < attempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelayMs * attempt)
        );
      }
    }
  }

  throw lastError;
}

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const GenerateVideoData = inngest.createFunction(
  {
    id: "generate-video-data",
    retries: 2,
    idempotency: "event.data.recordId",
    onFailure: async ({ event, error, step }) => {
      const recordId = event.data.event.data.recordId;
      await step.run("MarkVideoFailed", () => failVideoJob(recordId, error));
    },
  },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, topic, caption, videoStyle, voice, recordId } =
      event?.data;

    // Live progress helper — the UI polls /api/video/[id] and mirrors whatever
    // step the pipeline is actually on instead of simulating it.
    const markStep = async (stepName, progress) => {
      const updated = await db
        .update(videoData)
        .set({ currentStep: stepName, progress, status: "generating" })
        .where(activeVideoJob(recordId))
        .returning({ id: videoData.id });
      if (updated.length === 0) {
        throw new NonRetriableError("Video job is already terminal or was deleted");
      }
      return updated[0].id;
    };

    // Step 1: Generate Audio (Gemini) → upload WAV to existing S3 bucket
    // Upload retries stay inside this step so a failed upload does NOT re-call Gemini.
    // Started but not awaited here, so it runs in parallel with the image-prompt branch.
    await step.run("MarkAudioStep", () => markStep("audio", 10));
    const audioPromise = step.run("GenerateAudioFile", async () => {
      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
      );

      const model = genAI.getGenerativeModel(
        { model: "gemini-3.8-flash-tts" },
        { apiVersion: "v1beta" }
      );

      const voiceName = resolveVoice(voice);

      const result = await withRetry(
        () =>
          model.generateContent({
            contents: [
              {
                role: "user",
                parts: [buildSpeechPart(script, voiceName)],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName,
                  },
                },
              },
            },
          }),
        { attempts: 3, baseDelayMs: 1500, label: "gemini-tts" }
      );

      const audioPart =
        result.response.candidates?.[0]?.content?.parts?.find(
          (part) => part.inlineData?.data
        );

      if (!audioPart?.inlineData?.data) {
        throw new Error("Gemini did not return audio data");
      }

      const wavBuffer = geminiAudioToWav(
        audioPart.inlineData.data,
        audioPart.inlineData.mimeType
      );

      let lastErr;

      for (let i = 0; i < 3; i++) {
        try {
          const downloadUrl = await uploadFile(
            wavBuffer,
            `audio/${recordId}.wav`,
            "audio/wav"
          );

          console.log("Audio URL (S3):", downloadUrl);
          return downloadUrl;
        } catch (e) {
          lastErr = e;

          console.error(
            `S3 audio upload attempt ${i + 1} failed:`,
            e?.message || e
          );

          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (i + 1))
          );
        }
      }

      throw lastErr;
    });


    // Step 2: Generate Image Prompts (independent of audio → started now, awaited below)
    const promptPromise = step.run(
      "generateImagePrompt",
      async () => {
        const FINAL_PROMPT = `Create five sequential scene prompts, or four for an unusually short script.
Use the supplied visual style consistently. Return JSON only.
Video context: ${JSON.stringify({
  videoStyle: videoStyle || "Cinematic",
  topic: topic || "",
  script,
})}`;

        console.log("[generateImagePrompt] Requesting prompts for script...");
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const respText = await result.response.text();
        const jsonStart = respText.indexOf("{");
        const jsonEnd = respText.lastIndexOf("}") + 1;
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Invalid image prompts JSON response: " + respText);
        }
        const cleanJSON = respText.slice(jsonStart, jsonEnd);
        const parsed = JSON.parse(cleanJSON);
        const scenes = Array.isArray(parsed)
          ? parsed
          : parsed?.scenes || parsed?.imagePrompts || [];
        if (!Array.isArray(scenes) || scenes.length === 0) {
          throw new Error("Invalid image prompts JSON response: " + respText);
        }
        console.log(`[generateImagePrompt] Generated ${scenes.length} scene image prompts.`);
        return scenes;
      },
    );

    // Images depend only on prompts. Do not wait for TTS before starting FLUX.
    // Keep each operation inside its existing durable step for retry/replay safety.
    const imagesPromise = promptPromise.then((GenerateImagePrompts) =>
      step.run("generateImages", async () => {
        // Validate Cloudflare credentials (server-side only)
        const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!cfAccountId || !cfApiToken) {
          throw new Error(
            "Missing Cloudflare credentials: ensure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are set in .env.local",
          );
        }

        const fluxUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

        // Generate + upload scenes with a bounded number of in-flight requests.
        // Order is preserved, so images[] stays scene-0, scene-1, ...
        const imageConcurrency = Math.max(
          1,
          Number(process.env.IMAGE_CONCURRENCY) || 3
        );
        const images = await mapWithConcurrency(
          GenerateImagePrompts,
          imageConcurrency,
          async (element, i) => {
            const rawPrompt = element?.imagePrompt || topic;

            console.log(
              `[generateImages] Generating image ${i + 1}/${GenerateImagePrompts.length} via FLUX...`,
            );

            // Call Cloudflare Workers AI FLUX. Retried here so a transient blip
            // does not fail the whole step and force every other scene to redo.
            const fluxResponse = await withRetry(
              () =>
                axios.post(
                  fluxUrl,
                  { prompt: rawPrompt, steps: 4 },
                  {
                    headers: {
                      Authorization: `Bearer ${cfApiToken}`,
                      "Content-Type": "application/json",
                    },
                    timeout: 120_000, // 2-minute timeout per image
                  }
                ),
              { attempts: 3, baseDelayMs: 1500, label: `flux scene ${i + 1}` }
            );

            // Validate the response structure
            const base64Image = fluxResponse.data?.result?.image;
            if (!base64Image || typeof base64Image !== "string") {
              throw new Error(
                `FLUX did not return image data for scene ${i + 1}. ` +
                `HTTP ${fluxResponse.status}, success=${fluxResponse.data?.success}`,
              );
            }

            // Decode Base64 JPEG into a buffer
            const imageBuffer = Buffer.from(base64Image, "base64");
            if (imageBuffer.length < 100) {
              throw new Error(
                `FLUX returned an unexpectedly small image for scene ${i + 1} (${imageBuffer.length} bytes)`,
              );
            }

            // Upload to S3 using the existing storage helper
            const s3Key = `images/${recordId}/scene-${i}.jpg`;
            let imageUrl;
            let lastErr;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                imageUrl = await uploadFile(imageBuffer, s3Key, "image/jpeg");
                break;
              } catch (e) {
                lastErr = e;
                console.error(
                  `S3 image upload attempt ${attempt + 1} for scene ${i + 1} failed:`,
                  e?.message || e,
                );
                await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
              }
            }
            if (!imageUrl) {
              throw lastErr;
            }

            console.log(`[generateImages] Scene ${i + 1} uploaded to S3: ${imageUrl}`);
            return imageUrl;
          }
        );

        return images;
      })
    );

    // Captions depend only on the uploaded audio, not on any scene images.
    const captionsPromise = audioPromise.then((GenerateAudioFile) =>
      step.run("generateCaptions", async () => {
        const deepgram = createClient(
          process.env.DEEPGRAM_API_KEY ||
            process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
        );
        const { result, error } = await withRetry(
          () =>
            deepgram.listen.prerecorded.transcribeUrl(
              { url: GenerateAudioFile },
              { model: "nova-3" }
            ),
          { attempts: 3, baseDelayMs: 1500, label: "deepgram" }
        );
        if (error) throw new Error(`Deepgram error: ${error.message}`);
        return result.results?.channels[0]?.alternatives[0]?.words;
      })
    );

    // Keep progress milestones ordered even when branches finish out of order.
    // This observer never blocks asset work, and all promises are joined below
    // so a failure in either branch is handled before anything can render.
    const progressPromise = (async () => {
      await Promise.all([audioPromise, promptPromise]);
      await step.run("MarkScenesStep", () => markStep("scenes", 35));
      await imagesPromise;
      await step.run("MarkCaptionsStep", () => markStep("captions", 60));
    })();

    const [GenerateAudioFile, GenerateImages, GenerateCaptions] =
      await Promise.all([
        audioPromise,
        imagesPromise,
        captionsPromise,
        progressPromise,
      ]);

    // Step 5: Save audio + images to Neon (status = generating)
    await step.run("UpdateDB", async () => {
      await db
        .update(videoData)
        .set({
          audioUrl: GenerateAudioFile,
          captionJson: GenerateCaptions,
          images: GenerateImages,
          status: "generating",
        })
        .where(activeVideoJob(recordId));
    });

    // Step 6: Render video via Remotion Lambda
    await step.run("MarkRenderStep", () => markStep("render", 65));
    // Persist once, before submitting, so retries/replays cannot reset the clock.
    const renderDeadline = await step.run(
      "RenderDeadline",
      () => Date.now() + RENDER_TIMEOUT_MS,
    );
    const RenderVideo = await step.run("RenderVideo", async () => {
      if (Date.now() >= renderDeadline) {
        throw new NonRetriableError("Render deadline exceeded (15 minutes)");
      }
      const services = await getFunctions({
        region: "us-east-1",
        compatibleOnly: true,
      });

      const functionName = services[0].functionName;

      const { renderId, bucketName } = await renderMediaOnLambda({
        region: "us-east-1",
        functionName,
        serveUrl: process.env.AWS_SERVE_URL,
        composition: "youtubeShort",
        inputProps: {
          videoData: {
            audioUrl: GenerateAudioFile,
            captionJson: GenerateCaptions,
            images: GenerateImages,
            caption,
          },
        },
        codec: "h264",
        imageFormat: "jpeg",
        maxRetries: 1,
        // Number of parallel render Lambda functions (Remotion splits the video
        // into this many chunks). This is capped by your AWS account's Lambda
        // concurrency quota — setting it too high triggers
        // "AWS Concurrency limit reached". Keep the existing account limit;
        // asset preparation overlaps without increasing render concurrency.
        // NOTE: `concurrency` and `framesPerLambda` are mutually exclusive in Remotion.
        concurrency: Number(process.env.RENDER_CONCURRENCY) || 8,
        privacy: "public",
      });

      return { renderId, bucketName, functionName };
    });

    // Each poll and wait is durable; no serverless request stays open waiting
    // for the render. Check wall time inside the step so replays stay deterministic.
    let downloadUrl;
    for (let poll = 0; ; poll++) {
      const result = await step.run(`PollRender-${poll}`, async () => {
        if (Date.now() >= renderDeadline) {
          throw new NonRetriableError("Render deadline exceeded (15 minutes)");
        }
        const progress = await getRenderProgress({
          region: "us-east-1",
          renderId: RenderVideo.renderId,
          bucketName: RenderVideo.bucketName,
          functionName: RenderVideo.functionName,
        });

        if (Date.now() >= renderDeadline) {
          throw new NonRetriableError("Render deadline exceeded (15 minutes)");
        }
        if (progress.fatalErrorEncountered) {
          throw new NonRetriableError(`Render failed: ${JSON.stringify(progress.errors ?? [])}`);
        }
        if (progress.done) {
          const outputUrl = progress.outputFile || (progress.outKey
            ? `https://${RenderVideo.bucketName}.s3.us-east-1.amazonaws.com/${progress.outKey}`
            : null);
          if (!outputUrl) {
            throw new NonRetriableError("Render completed without an output file");
          }
          return { done: true, downloadUrl: outputUrl };
        }

        // Push Remotion's real render percentage to the DB (65% → 99%) so the
        // progress page mirrors the actual render, not a simulated bar.
        const renderPct =
          typeof progress.overallProgress === "number"
            ? progress.overallProgress
            : typeof progress.progress === "number"
              ? progress.progress
              : 0;
        await markStep("render", Math.min(99, 65 + Math.round(renderPct * 34)));
        return { done: false };
      });
      if (result.done) {
        downloadUrl = result.downloadUrl;
        break;
      }
      await step.sleep(`WaitForRender-${poll}`, "5s");
    }

    await step.run("UpdateDownloadUrl", async () => {
      await db
        .update(videoData)
        .set({ downloadUrl, status: "completed", currentStep: "done", progress: 100, errorMessage: null })
        .where(activeVideoJob(recordId));

      return downloadUrl;
    });

    return "Executed Successfully!";
  },
);

// Also repairs pre-existing orphaned rows. Expiration runs before dispatch so
// outages cannot leave pending/generating videos nonterminal indefinitely.
export const RecoverVideoJobs = inngest.createFunction(
  { id: "recover-video-jobs", retries: 2, concurrency: 1 },
  { cron: "* * * * *" },
  async ({ step }) => {
    await step.run("ExpirePendingVideos", () => expireVideoJobs(
      "pending", DISPATCH_TIMEOUT_MS, "Video dispatch deadline exceeded (30 minutes)",
    ));
    // Safety net for interrupted runs or unavailable failure handlers. Measured
    // from creation so no new schema is needed to repair existing stuck jobs.
    await step.run("ExpireStalledVideos", () => expireVideoJobs(
      "generating", JOB_TIMEOUT_MS, "Video generation deadline exceeded (2 hours)",
    ));
    const pending = await step.run("FindPendingVideos", () => db
      .select()
      .from(videoData)
      .where(and(
        eq(videoData.status, "pending"),
        lt(videoData.createdAt, new Date(Date.now() - 60_000)),
      ))
      .orderBy(asc(videoData.createdAt))
      .limit(100));
    if (pending.length > 0) {
      try {
        await step.sendEvent("RedispatchPendingVideos", pending.map(videoJobEvent));
      } catch (error) {
        // Leave the outbox intact for the next cron tick. Keep the recovery
        // function healthy during event-service outages so expiration continues.
        console.error("[RecoverVideoJobs] Dispatch deferred:", error);
        return { dispatched: 0, deferred: pending.length };
      }
    }
    return { dispatched: pending.length };
  },
);
