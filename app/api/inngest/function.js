import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { GenerateImageScript } from "@/config/AiModel";
import { inngest } from "@/inngest/client";
import { createClient } from "@deepgram/sdk";
import { eq } from "drizzle-orm";
import axios from "axios";
import {
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

const ImagePromptScript = `Generate image prompts for a {style} style video based on the following script. 
- Break the script into 4-5 meaningful scenes.
- For each scene, provide a unique sceneContent summarizing that specific scene.
- For each scene, give an image prompt that visually represents that scene based on the storyline.
- Do not include camera angles in the image prompt.

Follow this JSON format strictly:
[
    {
        imagePrompt: '',
        sceneContent: ''
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

    // Step 1: Generate Audio File
    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      const result = await axios.post(
        BASE_URL + "/api/text-to-speech",
        { input: script, voice: voice },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Audio URL:", result.data.audio);
      return result.data.audio;
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
        const FINAL_PROMPT = ImagePromptScript.replace("{style}", videoStyle).replace("{script}", script);
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const respText = result.response.text();
        const jsonStart = respText.indexOf("[");
        const jsonEnd = respText.lastIndexOf("]") + 1;
        const cleanJSON = respText.slice(jsonStart, jsonEnd);
        return JSON.parse(cleanJSON);
      },
    );

    // Step 4: Generate Images
    const GenerateImages = await step.run("generateImages", async () => {
      const images = await Promise.all(
        GenerateImagePrompts.map(async (element) => {
          const result = await axios.post(
            BASE_URL + "/api/generate-image",
            {
              width: 1024,
              height: 1024,
              input: element?.imagePrompt,
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
          console.log("Image URL:", result.data.image);
          return result.data.image;
        }),
      );
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