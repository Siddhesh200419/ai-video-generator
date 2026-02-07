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
    <div>
      <h2 className="text-3xl">Create New Video </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-7">
        <div className="col-span-2 p-7 border rounded-xl h-[72vh] overflow-auto">
          {/* Topic and Script */}
          <Topic onHandleInputChange={onHandleInputChange} />
          {/* Video Image Style  */}
          <VideoStyle onHandleInputChange={onHandleInputChange} />
          {/* Voice  */}
          <Voice onHandleInputChange={onHandleInputChange} />

          {/* Captions */}
          <Captions onHandleInputChange={onHandleInputChange} />
          <Button
            className="w-full mt-5"
            disable={loading}
            onClick={GenerateVideo}
          >
            {" "}
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <WandSparkles />
            )}
            Generate Video
          </Button>
        </div>

        <div>
          <Preview formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
