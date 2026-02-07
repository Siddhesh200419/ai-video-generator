"use client";
import React, { useState } from "react";
import Topic from "./_components/Topic";
import VideoStyle from "./_components/VideoStyle";
import Voice from "./_components/Voice";
import Captions from "./_components/Captions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, WandSparkles } from "lucide-react";
import Preview from "./_components/Preview";
import axios from "axios";
import { useMutation } from "convex/react";
import { useAuthContext } from "@/app/provider";
import { api } from "@/convex/_generated/api";
import { v } from "convex/values";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function CreateNewVideo() {
  const [formData, setFormData] = useState();
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(formData);
  };

  const GenerateVideo = async () => {

    if(user?.credits <= 0 ){
      toast('Please Add More Credits')
      return;
    }

    if (
      !formData?.topic ||
      !formData?.script ||
      !formData?.videoStyle ||
      !formData?.caption ||
      !formData?.voice
    ) {
      console.log("ERROR", "Enter all Fields");
      return;
    }
    setLoading(true);
    //Save video data first
    const resp = await CreateInitialVideoRecord({
      title: formData.title,
      topic: formData.topic,
      script: formData.script,
      videoStyle: formData.videoStyle,
      caption: formData.caption,
      voice: formData.voice,
      uid: user?._id,
      createdBy: user?.email,
      credits: user?.credits ?? 0, // example fallback if user credits is undefined
    });

    console.log(resp);

    const result = await axios.post("/api/generate-video-data", {
      ...formData,
      recordId: resp,
    });
    console.log(result);
    setLoading(false);
    toast("Video generation started!");
    router.push("/dashboard");
  };
  return (
    <div className="md:px-20 px-4">
      <h2 className="text-2xl md:text-4xl text-primary font-bold">Create New Video</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 mt-10 gap-6 md:gap-10">
        <div className="col-span-2 shadow-md p-4 md:p-10 rounded-xl bg-card border border-border/20">
          
          {/* Step 1: Content Strategy */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm mb-6 transition-all hover:border-primary/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Content Strategy
            </h3>
            <div className="pl-10 space-y-6">
               <Topic onHandleInputChange={onHandleInputChange} />
            </div>
          </div>

          {/* Step 2: Visual Style */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm mb-6 transition-all hover:border-primary/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Visual Style
            </h3>
            <div className="pl-10">
               <VideoStyle onHandleInputChange={onHandleInputChange} />
            </div>
          </div>

          {/* Step 3: Audio & Captions */}
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm mb-6 transition-all hover:border-primary/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
               <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
               Audio & Captions
            </h3>
            <div className="pl-10 space-y-8">
               <Voice onHandleInputChange={onHandleInputChange} />
               <div className="border-t border-border/40 my-4"></div>
               <Captions onHandleInputChange={onHandleInputChange} />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
             <Button
               size="lg"
               className="w-full md:w-auto px-10 py-6 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
               disable={loading}
               onClick={GenerateVideo}
             >
               {loading ? (
                 <Loader2Icon className="animate-spin mr-2" />
               ) : (
                 <WandSparkles className="mr-2" />
               )}
               Generate Video
             </Button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="sticky top-24">
             <Preview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
