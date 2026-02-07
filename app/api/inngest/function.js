import { GenerateImageScript } from "@/config/AiModel";
import { api } from "@/convex/_generated/api";
import { inngest } from "@/inngest/client";
import { createClient } from "@deepgram/sdk"; // ✅ updated import
import axios from "axios";
import { ConvexHttpClient } from "convex/browser";
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
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId } =
      event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    // Generate Audio File MP3
    const GenerateAudioFile = await step.run("GenerateAudioFile", async () => {
      const result = await axios.post(
        BASE_URL + "/api/text-to-speech",
        {
          input: script,
          voice: voice,
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
            "Content-Type": "application/json", // Content Type
          },
        },
      );
      console.log(result.data.audio); //Output Result: Audio Mp3 Url
      return result.data.audio;
    });

    // Generate Captions
    const GenerateCaptions = await step.run("generateCaptions", async () => {
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY); // ✅ updated client
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: GenerateAudioFile,
        },
        {
          model: "nova-3",
        },
      );
      return result.results?.channels[0]?.alternatives[0]?.words;
    });

    // Generate Image Prompt from Script
    const GenerateImagePrompts = await step.run(
      "generateImagePrompt",
      async () => {
        const FINAL_PROMPT = ImagePromptScript.replace(
          "{style}",
          videoStyle,
        ).replace("{script}", script);
        const result = await GenerateImageScript.sendMessage(FINAL_PROMPT);
        const respText = result.response.text();
        // Clean JSON
        const jsonStart = respText.indexOf("[");
        const jsonEnd = respText.lastIndexOf("]") + 1;
        const cleanJSON = respText.slice(jsonStart, jsonEnd);
        const resp = JSON.parse(cleanJSON);

        return resp;
      },
    );
    // Generate Images using AI
    const GenerateImages = await step.run("generateImages", async () => {
      let images = [];
      images = await Promise.all(
        GenerateImagePrompts.map(async (element) => {
          const result = await axios.post(
            BASE_URL + "/api/generate-image",
            {
              width: 1024,
              height: 1024,
              input: element?.imagePrompt,
              model: "sdxl", //'flux'
              aspectRatio: "1:1", //Applicable to Flux model only
            },
            {
              headers: {
                "x-api-key": process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
                "Content-Type": "application/json", // Content Type
              },
            },
          );
          console.log(result.data.image);
          return result.data.image;
        }),
      );
      return images;
    });

    // Save all data to database
    const UpdateDB = await step.run("UpdateDB", async () => {
      const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
        recordId: recordId,
        audioUrl: GenerateAudioFile,
        captionJson: GenerateCaptions,
        images: GenerateImages,
      });
      return result;
    });

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
            videoData:{
                audioUrl: GenerateAudioFile,
                captionJson: GenerateCaptions,
                images: GenerateImages,
            }
        },
        codec: "h264",
        imageFormat: "jpeg",
        maxRetries: 1,
        framesPerLambda: 20,
        privacy: "public",
      });

      return { renderId, bucketName, functionName };
    });

    const UpdateDownloadUrl = await step.run("UpdateDownloadUrl", async () => {
      try {
        let progress;
        do {
          progress = await getRenderProgress({
            region: "us-east-1",
            renderId: RenderVideo.renderId,
            bucketName: RenderVideo.bucketName,
            functionName: RenderVideo.functionName,
          });
          if (!progress.done) {
            await step.sleep("wait-progress", "10s");
          }
        } while (!progress.done && !progress.fatalErrorEncountered);

        if (progress.fatalErrorEncountered) {
          throw new Error(
            `Render failed: ${JSON.stringify(progress.errors ?? [])}`,
          );
        }

        const downloadUrl =
          progress.outputFile ??
          `https://${RenderVideo.bucketName}.s3.us-east-1.amazonaws.com/${progress.outKey}`;

        const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
          recordId: recordId,
          audioUrl: GenerateAudioFile,
          captionJson: GenerateCaptions,
          images: GenerateImages,
          downloadUrl,
        });
        return result;
      } catch (error) {
        console.error("Error updating download URL:", error);
        throw error;
      }
    });

    return "Executed Sucessfully!!";
  },
);
