import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { GenerateVideoData, RecoverVideoJobs, helloWorld } from "./function";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    GenerateVideoData,
    RecoverVideoJobs,
  ],
});
