"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Film,
  Loader2,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StepHeader, StepNav } from "@/components/creation/StepNav";
import { useCreationContext } from "@/_context/CreationContext";
import { useAuthContext } from "@/app/provider";
import toast from "react-hot-toast";

export default function ReviewStep() {
  const router = useRouter();
  const { formData, updateFormData } = useCreationContext();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const scriptWords = formData.script
    ? formData.script.split(/\s+/).filter(Boolean).length
    : 0;

  const isFormComplete =
    !!formData.script &&
    !!formData.voice &&
    !!formData.caption &&
    !!formData.videoStyle;

  const handleGenerateVideo = async () => {
    if (!user) {
      toast.error("Please log in or sign up before generating a video");
      router.push("/log-in");
      return;
    }

    if (!isFormComplete) {
      toast.error("Please complete all steps before generating");
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch("/api/generate-video-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title || formData.topic || "Untitled Short",
          topic: formData.topic || formData.title,
          script: formData.script,
          videoStyle: formData.videoStyle,
          caption: formData.caption,
          voice: formData.voice,
          uid: user?.id,
          createdBy: user?.email,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err?.error || "Failed to generate video");
      }

      const result = await resp.json();
      toast.success("Generation started!");
      const recordId = result.recordId || result.video?.id;
      if (recordId) {
        router.push(`/generation-progress?videoId=${recordId}`);
      } else {
        router.push("/my-videos");
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to start generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <StepHeader />
      <StepNav currentStep={5} />

      <main className="grid px-6 md:px-10 py-8 flex-1 gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] max-w-7xl mx-auto w-full">
        <section className="rounded-xl bg-card border border-border flex p-6 flex-col min-w-0 shadow-sm">
          {/* Progress Header */}
          <div className="rounded-lg bg-muted border border-border flex mb-8 px-4 py-3 items-center gap-3">
            <Film className="text-primary size-5" />
            <div className="flex flex-1 gap-2">
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              Review ready
            </span>
          </div>

          <div className="flex flex-col flex-1">
            <div className="mb-6">
              <h1 className="font-semibold text-2xl tracking-tight !mb-0">
                Ready to make it real?
              </h1>
              <p className="text-muted-foreground text-sm !mt-1">
                Confirm your Short configuration before generating.
              </p>
            </div>

            {/* Review Cards list */}
            <div className="rounded-lg border border-border flex flex-col overflow-hidden divide-y divide-border bg-card">
              {/* Script review */}
              <div className="flex p-4 justify-between items-center gap-6">
                <div className="min-w-0">
                  <p className="font-semibold text-sm !mt-0">Script</p>
                  <p className="text-muted-foreground text-sm mt-1 !mt-1 truncate">
                    {formData.script
                      ? formData.script.substring(0, 60) + "..."
                      : "No script selected"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1 !mt-1">
                    {scriptWords} words
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/script-step")}
                  className="font-medium text-primary text-sm shrink-0 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Voice review */}
              <div className="flex p-4 justify-between items-center gap-6">
                <div className="min-w-0">
                  <p className="font-semibold text-sm !mt-0">Voice</p>
                  <p className="text-muted-foreground text-sm mt-1 !mt-1 truncate">
                    {formData.voice || "Nova"} · {formData.voiceSpeed || 1.0}x
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/voice-step")}
                  className="font-medium text-primary text-sm shrink-0 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Captions review */}
              <div className="flex p-4 justify-between items-center gap-6">
                <div className="min-w-0">
                  <p className="font-semibold text-sm !mt-0">Captions</p>
                  <p className="text-muted-foreground text-sm mt-1 !mt-1 truncate">
                    {formData.caption?.name || "Bold highlight"} ·{" "}
                    {formData.caption?.font || "Bricolage Grotesque"} ·{" "}
                    {formData.caption?.position || "bottom"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/captions-step")}
                  className="font-medium text-primary text-sm shrink-0 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Theme review */}
              <div className="flex p-4 justify-between items-center gap-6">
                <div className="min-w-0">
                  <p className="font-semibold text-sm !mt-0">Theme</p>
                  <p className="text-muted-foreground text-sm mt-1 !mt-1 truncate">
                    {formData.videoStyle || "Cinematic"} ·{" "}
                    {formData.mood || "Lo-fi"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/theme-step")}
                  className="font-medium text-primary text-sm shrink-0 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Film Grain Texture Option */}
            <label className="text-foreground text-sm flex mt-6 items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.filmGrain || false}
                onChange={(e) => updateFormData("filmGrain", e.target.checked)}
                className="accent-primary rounded-xs border-input size-4"
              />
              Include subtle film-grain texture
            </label>

            {!isFormComplete && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 flex mt-6 p-4 justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-sm text-destructive !mt-0">
                    Missing configuration
                  </p>
                  <p className="text-muted-foreground text-xs mt-1 !mt-0">
                    Please ensure script, voice, caption and theme are chosen.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="font-medium opacity-50 rounded-md bg-secondary text-secondary-foreground text-sm inline-flex px-3 items-center h-9"
                >
                  Generate video
                </button>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="flex mt-8 justify-between items-center pt-4 border-t border-border">
            <button
              type="button"
              className="font-medium rounded-md bg-card text-foreground text-sm border border-border inline-flex px-4 items-center gap-2 h-10 hover:bg-accent"
              onClick={() => router.push("/theme-step")}
            >
              Back
            </button>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-xs hidden sm:inline">
                Usually ready in under 2 minutes.
              </span>
              <button
                type="button"
                disabled={loading || !isFormComplete}
                className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90 disabled:opacity-50"
                onClick={handleGenerateVideo}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Generate video
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Preview */}
        <aside className="flex sticky top-6 flex-col items-center gap-4 h-fit">
          <div className="rounded-2xl bg-muted border border-border flex p-4 flex-col justify-end w-full max-w-[320px] aspect-[9/16] relative overflow-hidden shadow-lg">
            <div className="flex justify-center items-center flex-1">
              <button
                type="button"
                aria-label="Play preview"
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full bg-primary text-primary-foreground flex justify-center items-center size-14 hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="size-6" />
                ) : (
                  <Play className="size-6 ml-0.5" />
                )}
              </button>
            </div>

            <div className="rounded-lg bg-card/90 flex p-3 flex-col gap-3 backdrop-blur-sm">
              <input
                type="range"
                min="0"
                max="30"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="accent-primary w-full"
              />
              <div className="text-muted-foreground text-xs flex justify-between items-center">
                <span>00:{progress.toString().padStart(2, "0")}</span>
                <span>00:30</span>
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  aria-label="Toggle volume"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-foreground"
                >
                  {isMuted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Toggle fullscreen"
                  className="text-foreground"
                >
                  <Maximize className="size-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">9:16 preview</div>
        </aside>
      </main>
    </div>
  );
}

