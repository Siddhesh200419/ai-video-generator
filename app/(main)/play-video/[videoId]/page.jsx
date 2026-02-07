"use client";
import React, { useEffect, useState } from "react";
import RemotionPlayer from "../_components/RemotionPlayer";
import VideoInfo from "../_components/VideoInfo";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

function page() {
  const { videoId } = useParams();
  const convex = useConvex();
  const [videoData, setVideoData] = useState();

  useEffect(() => {
    videoId && GetVideoDataById();
  }, [videoId]);

  const GetVideoDataById = async () => {
    const result = await convex.query(api.videoData.GetVideoById, {
      videoId: videoId,
    });
    console.log(result);
    setVideoData(result);
  };

  useEffect(() => {
    if (!videoId) return;
    const interval = setInterval(async () => {
      const result = await convex.query(api.videoData.GetVideoById, {
        videoId,
      });
      setVideoData(result);
      if (result?.downloadUrl) {
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [videoId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        {/* RemotionPlayer */}
        <RemotionPlayer videoData={videoData} />
      </div>

      <div>
        {/* Video Information */}
        <VideoInfo videoData={videoData} />
      </div>
    </div>
  );
}

export default page;
