"use client";
import { useAuthContext } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { Play, Clock } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function VideoList() {
  const [videoList, setVideoList] = useState([]);
  const convex = useConvex();
  const { user } = useAuthContext();

  useEffect(() => {
    user && GetUserVideoList();
  }, [user]);

  const GetUserVideoList = async () => {
    //All user videos
    const result = await convex.query(api.videoData.GetUserVideo, {
      uid: user?._id,
    });
    setVideoList(result);
    const isPendingVideo = result?.find((item) => item.status == "pending");
    isPendingVideo && GetPendingVideoStatus(isPendingVideo);
  };

  const GetPendingVideoStatus = (pendingVideo) => {
    const intervalId = setInterval(async () => {
      // Get Video Data by Id
      const result = await convex.query(api.videoData.GetVideoById, {
        videoId: pendingVideo?._id,
      });

      if (result?.status == "completed") {
        clearInterval(intervalId);
        console.log("Video Process Completed");
        GetUserVideoList();
      }
      console.log("Still Pending...");
    }, 5000);
  };

  return (
    <div>
      {videoList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-5 p-10 border border-dashed border-border rounded-xl bg-card/50">
          <Image src={"/logo.svg"} alt="logo" width={60} height={60} className="opacity-50 grayscale" />
          <h2 className="text-muted-foreground text-lg font-medium">
            You haven't created any videos yet.
          </h2>
          <Link href={"/create-new-video"}>
            <Button size="lg" className="shadow-md">Create New Video</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-10">
          {videoList?.map((video, index) => (
            <Link key={index} href={video?._id ? `/play-video/${video._id}` : '#'} className="group block">
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={video?.images[0]}
                    alt={video?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 w-full p-4 text-white">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1 mb-1 group-hover:text-primary-foreground transition-colors">
                      {video?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300/90 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{moment(video?._creationTime).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoList;
