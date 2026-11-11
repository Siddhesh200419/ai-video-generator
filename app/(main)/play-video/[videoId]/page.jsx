"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import VideoInfo from "../_components/VideoInfo";

const RemotionPlayer = dynamic(
  () => import("../_components/RemotionPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full max-w-[400px] aspect-[9/16]">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    ),
  }
);
import { useParams, useRouter } from "next/navigation";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/app/provider";
import { PIPELINE_STEPS, getStepState } from "@/lib/videoProgress";
import toast from "react-hot-toast";

function PlayVideoPage() {
  const { videoId } = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [videoData, setVideoData] = useState();
  const [deleting, setDeleting] = useState(false);

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
      // Skip polling while the tab is in the background.
      if (document.hidden) return;
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
  const percent = videoData?.progress ?? 0;

  const handleDelete = async () => {
    if (!user?.id || !videoId) return;
    setDeleting(true);
    try {
      const resp = await fetch(`/api/video/${videoId}?uid=${user.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete video");
      }
      toast.success("Video deleted");
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete video");
      setDeleting(false);
    }
  };

  const displayTitle =
    videoData?.title && videoData?.title !== "w" && videoData?.title !== "W"
      ? videoData.title
      : videoData?.topic || "Untitled Short";

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
                  Current stage
                </span>
                <span className="font-medium text-base">
                  {PIPELINE_STEPS.find((s) => s.key === videoData?.currentStep)
                    ?.label || "Queued"}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {PIPELINE_STEPS.map((step) => {
                  const state = getStepState(step.key, videoData);
                  const isComplete = state === "complete";
                  const isActive = state === "active";

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`rounded-full flex justify-center items-center shrink-0 size-8 ${
                          isComplete
                            ? "bg-primary text-primary-foreground"
                            : isActive
                              ? "bg-accent text-accent-foreground"
                              : "bg-background border-2 border-border"
                        }`}
                      >
                        {isComplete && <Check className="size-4" />}
                        {isActive && (
                          <LoaderCircle className="animate-spin size-4" />
                        )}
                      </div>
                      <div className="flex pt-1 flex-col gap-1">
                        <span
                          className={`font-medium ${
                            isComplete || isActive ? "" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span
                          className={`text-sm ${
                            isActive
                              ? "text-accent-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isComplete
                            ? "Complete"
                            : isActive
                              ? step.activeLabel
                              : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                  {displayTitle?.toUpperCase()?.substring(0, 24)}
                </span>
              </div>
              <div className="bg-primary absolute inset-x-0 bottom-0 h-1">
                <div className="bg-primary-foreground/70 w-1/3 h-full animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-96">
              <Progress value={percent} className="bg-muted h-1.5" />
              <div className="flex justify-between items-center">
                <span className="font-mono text-muted-foreground text-sm">
                  {percent}% complete
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
                {displayTitle}
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
  const enrichedVideoData = videoData ? { ...videoData, title: displayTitle } : videoData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="flex justify-center items-start">
        <RemotionPlayer videoData={enrichedVideoData} />
      </div>
      <div>
        <VideoInfo
          videoData={enrichedVideoData}
          onDelete={handleDelete}
          deleting={deleting}
        />
      </div>
    </div>
  );
}

export default PlayVideoPage;
