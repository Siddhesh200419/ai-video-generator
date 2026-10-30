"use client";
import React, { useEffect, useState } from "react";
import RemotionPlayer from "../_components/RemotionPlayer";
import VideoInfo from "../_components/VideoInfo";
import { useParams } from "next/navigation";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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

  const isRendering =
    videoData?.status === "pending" || videoData?.status === "generating";
  const isFailed = videoData?.status === "failed";
  const isReady = videoData?.status === "completed";

  // Show generation progress view while rendering
  if (isRendering) {
    return (
      <div className="flex flex-col gap-10 max-w-7xl mx-auto">
        <section className="grid items-center flex-1 gap-12 md:gap-20 grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-8 max-w-xl">
            <div className="flex flex-col gap-4">
              <p className="font-medium uppercase text-primary text-sm tracking-[0.2em] !mt-0">
                ReelForge
              </p>
              <h1 className="font-semibold text-4xl md:text-5xl tracking-tight max-w-lg !mb-0">
                Your Short is taking shape
              </h1>
              <p className="text-muted-foreground text-xl !mt-2">
                A little cinematic magic is happening.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground text-sm">
                  Status
                </span>
                <span className="font-medium text-base">
                  {videoData?.status === "generating"
                    ? "Generating..."
                    : "Pending..."}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary text-primary-foreground flex justify-center items-center shrink-0 size-8">
                    <Check className="size-4" />
                  </div>
                  <div className="flex pt-1 flex-col gap-1">
                    <span className="font-medium">Writing voiceover</span>
                    <span className="text-muted-foreground text-sm">
                      Complete
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-accent text-accent-foreground flex justify-center items-center shrink-0 size-8">
                    <LoaderCircle className="animate-spin size-4" />
                  </div>
                  <div className="flex pt-1 flex-col gap-1">
                    <span className="font-medium">Creating images</span>
                    <span className="text-accent-foreground text-sm">
                      In progress...
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-background border-2 border-border shrink-0 size-8" />
                  <div className="flex pt-1 flex-col gap-1">
                    <span className="font-medium text-muted-foreground">
                      Syncing captions
                    </span>
                    <span className="text-muted-foreground text-sm">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-background border-2 border-border shrink-0 size-8" />
                  <div className="flex pt-1 flex-col gap-1">
                    <span className="font-medium text-muted-foreground">
                      Rendering video
                    </span>
                    <span className="text-muted-foreground text-sm">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview placeholder */}
          <div className="flex flex-col items-center gap-6">
            <div className="shadow-xl rounded-2xl bg-foreground border border-border relative w-72 md:w-96 aspect-[9/16] overflow-hidden">
              <div className="bg-foreground absolute inset-0" />
              <div className="font-semibold rounded-md bg-accent text-accent-foreground text-xs tracking-wide flex absolute top-5 left-5 px-3 py-1.5 items-center gap-2">
                <span className="rounded-full bg-accent-foreground size-2" />
                RENDERING
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="text-primary size-16 animate-spin" />
              </div>
              <div className="flex absolute inset-x-8 bottom-12 flex-col gap-3">
                <span className="font-semibold animate-pulse bg-foreground/80 text-primary text-xl tracking-[0.16em] px-3 py-1 w-fit">
                  {videoData?.title?.toUpperCase()?.substring(0, 20)}
                </span>
              </div>
              <div className="bg-primary absolute inset-x-0 bottom-0 h-1">
                <div className="bg-primary-foreground/70 w-1/3 h-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-96">
              <Progress value={40} className="bg-muted h-1.5" />
              <div className="flex justify-between items-center">
                <span className="font-mono text-muted-foreground text-sm">
                  Generating...
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show error state
  if (isFailed) {
    return (
      <div className="flex flex-col gap-10 max-w-7xl mx-auto">
        <section className="shadow-xs rounded-xl bg-card border border-destructive/30 flex px-6 py-8 flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-destructive/10 text-destructive flex justify-center items-center size-10">
              <TriangleAlert className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Video generation failed</span>
              <span className="text-muted-foreground text-sm">
                {videoData?.title}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </section>
      </div>
    );
  }

  // Show completed video result
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="flex justify-center items-start">
        <RemotionPlayer videoData={videoData} />
      </div>
      <div>
        <VideoInfo videoData={videoData} />
      </div>
    </div>
  );
}

export default PlayVideoPage;
