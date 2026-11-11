"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { triggerConfetti } from "@/lib/confetti";
import { useCreationContext } from "@/_context/CreationContext";
import { PIPELINE_STEPS, getStepState } from "@/lib/videoProgress";

function GenerationProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const { resetFormData } = useCreationContext();
  const [videoData, setVideoData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const finishedRef = useRef(false);

  // Mirror the real Inngest pipeline by polling the record it updates.
  useEffect(() => {
    if (!videoId) return;
    let interval;

    const checkStatus = async () => {
      // Don't poll while the tab is hidden — resume on the next visible tick.
      if (document.hidden) return;
      try {
        const resp = await fetch(`/api/video/${videoId}`);
        if (!resp.ok) return;
        const data = await resp.json();
        setVideoData(data);

        if (data.status === "completed") {
          if (finishedRef.current) return;
          finishedRef.current = true;
          clearInterval(interval);
          triggerConfetti();
          resetFormData();
          setTimeout(() => {
            router.push(`/video-result?videoId=${videoId}`);
          }, 1200);
        } else if (data.status === "failed") {
          setHasError(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [videoId, router]);

  // Real progress reported by the pipeline (0-100).
  const percent = videoData?.progress ?? 0;
  const stepState = {
    currentStep: videoData?.currentStep,
    status: videoData?.status,
  };
  const currentStepLabel =
    PIPELINE_STEPS.find((s) => s.key === videoData?.currentStep)?.label ||
    "Queued";

  const displayTitle =
    videoData?.title && videoData?.title !== "w" && videoData?.title !== "W"
      ? videoData.title
      : videoData?.topic || "ONE TINY";

  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      <main className="px-6 md:px-12 py-10 min-h-screen">
        <div className="flex mx-auto flex-col gap-10 min-h-[700px] max-w-7xl">
          <section className="grid items-center flex-1 gap-12 lg:gap-20 grid-cols-1 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-8 max-w-xl">
              <div className="flex flex-col gap-4">
                <Link
                  href="/my-videos"
                  className="font-medium uppercase text-primary text-sm tracking-[0.2em]"
                >
                  ReelForge
                </Link>
                <h1 className="font-semibold text-4xl md:text-5xl tracking-tight max-w-lg !mb-0">
                  Your Short is taking shape
                </h1>
                <p className="text-muted-foreground text-xl !mt-0">
                  A little cinematic magic is happening.
                </p>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground text-sm">
                    Current stage
                  </span>
                  <span className="font-medium text-base">
                    {hasError ? "Failed" : currentStepLabel}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {PIPELINE_STEPS.map((step) => {
                    const state = getStepState(step.key, stepState);
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
                              isComplete || isActive
                                ? ""
                                : "text-muted-foreground"
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

            {/* Right 9:16 visual container */}
            <div className="flex flex-col items-center gap-6">
              <div className="shadow-xl rounded-2xl bg-foreground border border-border relative w-72 sm:w-96 aspect-[9/16] overflow-hidden">
                <div className="bg-foreground absolute inset-0" />
                <div className="font-semibold rounded-md bg-accent text-accent-foreground text-xs tracking-wide flex absolute top-5 left-5 px-3 py-1.5 items-center gap-2">
                  <span className="rounded-full bg-accent-foreground size-2" />
                  LIVE
                </div>
                <div className="-translate-y-1/2 flex absolute inset-x-0 top-1/2 justify-center items-center">
                  <div className="rounded-full bg-muted-foreground/10 border-8 border-muted-foreground/30 flex relative justify-center items-center size-56">
                    <div className="rounded-full bg-foreground border-4 border-muted-foreground/40 flex justify-center items-center size-40">
                      <div className="rounded-full bg-primary size-8 animate-pulse" />
                    </div>
                    <div className="rotate-32 origin-bottom rounded-full bg-muted-foreground/70 absolute -top-[1rem] -right-[2.5rem] w-2 h-28" />
                    <div className="rounded-full bg-primary absolute -top-[1.75rem] -right-[3.25rem] size-5" />
                  </div>
                </div>
                <div className="bg-primary/20 absolute inset-x-0 bottom-0 h-2/3" />
                <div className="flex absolute inset-x-8 bottom-12 flex-col gap-3">
                  <span className="font-semibold animate-pulse bg-foreground/80 text-primary text-xl sm:text-2xl tracking-[0.16em] px-3 py-1 w-fit">
                    {((videoData?.title && videoData?.title !== "w" && videoData?.title !== "W") ? videoData.title : (videoData?.topic || "ONE TINY")).substring(0, 15).toUpperCase()}
                  </span>
                  <span className="font-semibold animate-pulse bg-foreground/80 text-primary text-xl sm:text-2xl tracking-[0.16em] px-3 py-1 w-fit">
                    CHORUS
                  </span>
                </div>
                <div className="bg-primary absolute inset-x-0 bottom-0 h-1">
                  <div
                    className="bg-primary-foreground/70 h-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 w-72 sm:w-96">
                <Progress value={percent} className="bg-muted h-1.5" />
                <div className="flex justify-between items-center">
                  <span className="font-mono text-muted-foreground text-sm">
                    {percent}% complete
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/my-videos")}
                  >
                    View my videos
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stalled error display */}
          {hasError && (
            <section className="shadow-xs rounded-xl bg-card border border-destructive/30 flex px-6 py-5 justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-destructive/10 text-destructive flex justify-center items-center size-10">
                  <TriangleAlert className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Video generation failed</span>
                  <span className="text-muted-foreground text-sm">
                    An error occurred while assembling this short.
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/review-step")}
              >
                Retry generation
              </Button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GenerationProgress() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <GenerationProgressContent />
    </Suspense>
  );
}
