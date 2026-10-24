"use client";
import React, { useEffect, useState } from "react";
import RemotionPlayer from "../_components/RemotionPlayer";
import VideoInfo from "../_components/VideoInfo";
import { useParams } from "next/navigation";

function PlayVideoPage() {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState();

  const fetchVideo = async () => {
    const resp = await fetch(`/api/video/${videoId}`);
    if (resp.ok) {
      const data = await resp.json();
      setVideoData(data);
      return data;
    }
    return null;
  };

  // Initial fetch
  useEffect(() => {
    if (videoId) fetchVideo();
  }, [videoId]);

  // Poll until the video is complete or failed
  useEffect(() => {
    if (!videoId) return;
    const interval = setInterval(async () => {
      const data = await fetchVideo();
      if (data?.status === "completed" || data?.status === "failed") {
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [videoId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <RemotionPlayer videoData={videoData} />
      </div>
      <div>
        <VideoInfo videoData={videoData} />
      </div>
    </div>
  );
}

export default PlayVideoPage;