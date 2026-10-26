import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { GenerateImageScript } from "@/config/AiModel";
import { inngest } from "@/inngest/client";
import { createClient } from "@deepgram/sdk";
import { eq } from "drizzle-orm";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadFile } from "@/lib/storage";
import { geminiAudioToWav } from "@/lib/pcmToWav";
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

const ImagePromptScript = `You are a visual director creating image prompts for an AI video generator.
Video Visual Style: {style}
Video Topic: {topic}

The spoken voiceover script of the video is:
"""
{script}
"""

Instructions:
1. Divide the script chronologically into exactly 4 to 5 distinct sequential scenes that visually narrate the entire story from start to finish.
2. For each scene, write a highly descriptive and visually evocative image prompt tailored for SDXL image generation.
3. Every prompt MUST directly illustrate the specific events, characters, environment, lighting, and mood described in that scene of the script.
4. Integrate the aesthetic details of "{style}" style (e.g. textures, color palette, lighting atmosphere).
5. DO NOT include any text, letters, watermarks, speech bubbles, camera angles (no "wide angle", "close-up"), or meta instructions in the image prompt. Describe purely the visual elements of the scene itself.
6. Return STRICTLY a valid JSON array matching this format:
[
  {
    "sceneContent": "Brief 1-sentence summary of the scene from the script",
    "imagePrompt": "Detailed visual description of the scene in {style} style..."
  }
]`;

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

const BASE_URL = "https://aigurulab.tech";

export const GenerateVideoData = inngest.createFunction(
  {
    id: "generate-video-data",
    retries: 2,
  },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId } =
      event?.data;

    // Step 1: Generate Audio (Gemini) → upload WAV to existing S3 bucket
    // Upload retries stay inside this step so a failed upload does NOT re-call Gemini.
    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel(
        { model: "gemini-3.8-flash-tts" },
        { apiVersion: "v1beta" },
      );

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: script }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });

      const audioPart = result.response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData,
      );

      if (!audioPart?.inlineData?.data) {
        throw new Error("Gemini did not return audio data");
      }

      const wavBuffer = geminiAudioToWav(
        audioPart.inlineData.data,
        audioPart.inlineData.mimeType,
      );

      let lastErr;
      for (let i = 0; i < 3; i++) {
        try {
          // Return ONLY the URL — never the buffer (Inngest step output size limits)
          const downloadUrl = await uploadFile(
            wavBuffer,
            `audio/${recordId}.wav`,
            "audio/wav",
          );
          console.log("Audio URL (S3):", downloadUrl);
          return downloadUrl;
        } catch (e) {
          lastErr = e;
          console.error(`S3 audio upload attempt ${i + 1} failed:`, e?.message || e);
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw lastErr;
    });

    // Step 2: Generate Captions
    const GenerateCaptions = await step.run("generateCaptions", async () => {
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: GenerateAudioFile },
        { model: "nova-3" },
      );
      if (error) throw new Error(`Deepgram error: ${error.message}`);
      return result.results?.channels[0]?.alternatives[0]?.words;
    });

    // Step 3: Generate Image Prompts
    const GenerateImagePrompts = await step.run(
      "generateImagePrompt",
      async () => {
        const FINAL_PROMPT = ImagePromptScript
          .replace(/{style}/g, videoStyle || "Cinematic")
          .replace(/{topic}/g, topic || "Topic")
          .replace(/{script}/g, script);

        console.log("[generateImagePrompt] Requesting prompts for script...");
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const respText = await result.response.text();
        const jsonStart = respText.indexOf("[");
        const jsonEnd = respText.lastIndexOf("]") + 1;
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Invalid image prompts JSON response: " + respText);
        }
        const cleanJSON = respText.slice(jsonStart, jsonEnd);
        const parsed = JSON.parse(cleanJSON);
        console.log(`[generateImagePrompt] Generated ${parsed.length} scene image prompts.`);
        return parsed;
      },
    );

    // Step 4: Generate Images
    const GenerateImages = await step.run("generateImages", async () => {
      const images = [];
      for (let i = 0; i < GenerateImagePrompts.length; i++) {
        const element = GenerateImagePrompts[i];
        const rawPrompt = element?.imagePrompt || topic;
        const enhancedPrompt = `${rawPrompt}, in ${videoStyle} style, 8k resolution, ultra detailed, cinematic atmosphere`;

        console.log(`[generateImages] Generating image ${i + 1}/${GenerateImagePrompts.length}:`, enhancedPrompt);
        const result = await axios.post(
          BASE_URL + "/api/generate-image",
          {
            width: 1024,
            height: 1024,
            input: enhancedPrompt,
            model: "sdxl",
            aspectRatio: "1:1",
          },
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(`[generateImages] Image ${i + 1} generated:`, result.data?.image);
        if (result.data?.image) {
          images.push(result.data.image);
        }
      }
      return images;
    });

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
        .where(eq(videoData.id, recordId));
    });

    // Step 6: Render video via Remotion Lambda
    const RenderVideo = await step.run("RenderVideo", async () => {
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
        concurrency: 4,
        privacy: "public",
      });

      return { renderId, bucketName, functionName };
    });

    // Step 7: Poll render progress + save download URL (status = completed)
    await step.run("UpdateDownloadUrl", async () => {
      let progress;
      do {
        progress = await getRenderProgress({
          region: "us-east-1",
          renderId: RenderVideo.renderId,
          bucketName: RenderVideo.bucketName,
          functionName: RenderVideo.functionName,
        });
        if (!progress.done) {
          await new Promise((r) => setTimeout(r, 10000));
        }
      } while (!progress.done && !progress.fatalErrorEncountered);

      if (progress.fatalErrorEncountered) {
        await db
          .update(videoData)
          .set({
            status: "failed",
            errorMessage: JSON.stringify(progress.errors ?? []),
          })
          .where(eq(videoData.id, recordId));
        throw new Error(`Render failed: ${JSON.stringify(progress.errors ?? [])}`);
      }

      const downloadUrl =
        progress.outputFile ??
        `https://${RenderVideo.bucketName}.s3.us-east-1.amazonaws.com/${progress.outKey}`;

      await db
        .update(videoData)
        .set({ downloadUrl, status: "completed" })
        .where(eq(videoData.id, recordId));

      return downloadUrl;
    });

    return "Executed Successfully!";
  },
);