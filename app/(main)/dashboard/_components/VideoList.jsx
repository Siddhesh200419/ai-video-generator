"use client";
import { useAuthContext } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Play, Clock, Loader2, AlertCircle } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function VideoList() {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user?.id) GetUserVideoList();
  }, [user]);

  const GetUserVideoList = async () => {
    setLoading(true);
    const resp = await fetch(`/api/videos?uid=${user?.id}`);
    const data = await resp.json();
    setVideoList(data ?? []);
    setLoading(false);

    // Poll any pending or generating videos
    const inProgress = data?.find(
      (v) => v.status === "pending" || v.status === "generating"
    );
    if (inProgress) StartPolling(inProgress.id);
  };

  const StartPolling = (videoId) => {
    const intervalId = setInterval(async () => {
      const resp = await fetch(`/api/video/${videoId}`);
      const video = await resp.json();
      if (video?.status === "completed" || video?.status === "failed") {
        clearInterval(intervalId);
        GetUserVideoList();
      }
    }, 5000);
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      generating: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    const labels = {
      pending: "Pending",
      generating: "Generating...",
      completed: "Ready",
      failed: "Failed",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? styles.pending}`}>
        {status === "generating" && (
          <Loader2 className="w-2.5 h-2.5 inline mr-1 animate-spin" />
        )}
        {status === "failed" && (
          <AlertCircle className="w-2.5 h-2.5 inline mr-1" />
        )}
        {labels[status] ?? "Pending"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden animate-pulse">
            <div className="aspect-[2/3] bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {videoList?.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-5 p-10 border border-dashed border-border rounded-xl bg-card/50">
          <Image src={"/logo.svg"} alt="logo" width={60} height={60} className="opacity-50 grayscale" />
          <h2 className="text-muted-foreground text-lg font-medium">
            You haven&apos;t created any videos yet.
          </h2>
          <Link href={"/create-new-video"}>
            <Button size="lg" className="shadow-md">Create New Video</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-10">
          {videoList?.map((video, index) => (
            <Link key={index} href={video?.id ? `/play-video/${video.id}` : "#"} className="group block">
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {video?.images?.[0] ? (
                    <img
                      src={video?.images[0]}
                      alt={video?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                  {/* Play Button */}
                  {video.status === "completed" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={video.status} />
                  </div>

                  {/* Title & Date */}
                  <div className="absolute bottom-0 w-full p-4 text-white">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1 mb-1">
                      {video?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-300/90 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{moment(video?.createdAt).fromNow()}</span>
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