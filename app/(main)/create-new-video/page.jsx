"use client";
import React, { useState } from "react";
import Topic from "./_components/Topic";
import VideoStyle from "./_components/VideoStyle";
import Voice from "./_components/Voice";
import Captions from "./_components/Captions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Film, Loader2Icon, Save, WandSparkles } from "lucide-react";
import Preview from "./_components/Preview";
import { useAuthContext } from "@/app/provider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const STEPS = ["Content", "Style", "Voice & Captions", "Review"];

function CreateNewVideo() {
  const [formData, setFormData] = useState();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const getStepCompletion = () => {
    let completed = 0;
    if (formData?.title && formData?.topic && formData?.script) completed++;
    if (formData?.videoStyle) completed++;
    if (formData?.voice && formData?.caption) completed++;
    if (completed === 3) completed++; // review is ready
    return completed;
  };

  const completedSteps = getStepCompletion();

  const GenerateVideo = async () => {
    if (!formData?.title) {
      toast.error("Please enter a project title");
      return;
    }
    if (!formData?.topic) {
      toast.error("Please select a theme or enter a topic");
      return;
    }
    if (!formData?.script) {
      toast.error("Please generate and select a script");
      return;
    }
    if (!formData?.videoStyle) {
      toast.error("Please select a visual style");
      return;
    }
    if (!formData?.voice) {
      toast.error("Please select a voice narrator");
      return;
    }
    if (!formData?.caption) {
      toast.error("Please select a caption style");
      return;
    }
    setLoading(true);
    const resp = await fetch("/api/generate-video-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        topic: formData.topic,
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
      toast.error(err?.error ?? "Failed to create video");
      setLoading(false);
      return;
    }

    const result = await resp.json();
    console.log("Video created:", result);
    setLoading(false);
    toast.success("Video generation started!");
    router.push("/dashboard");
  };

  return (
    <div className="bg-background text-foreground flex flex-col min-h-[760px]">
      {/* Step Progress Nav */}
      <nav
        aria-label="Create flow steps"
        className="border-b border-b-border flex px-8 py-6 justify-center items-center"
      >
        <ol className="flex justify-between items-center w-full max-w-3xl">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <li
                className={`font-medium text-sm flex items-center gap-2 cursor-pointer ${
                  i <= completedSteps
                    ? i === activeStep
                      ? "font-semibold text-primary"
                      : "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveStep(i)}
              >
                <span
                  className={`rounded-full flex justify-center items-center size-7 text-xs font-semibold ${
                    i < completedSteps
                      ? "bg-primary text-primary-foreground"
                      : i === completedSteps
                      ? "bg-primary text-primary-foreground"
                      : "border border-border"
                  }`}
                >
                  {i < completedSteps ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </li>
              {i < STEPS.length - 1 && (
                <li
                  className={`mx-3 flex-1 h-px ${
                    i < completedSteps ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      {/* Main Content */}
      <main className="grid px-4 md:px-10 py-8 flex-1 gap-10 grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl bg-card border border-border flex p-6 flex-col min-w-0">
          {/* Progress Bar */}
          <div className="rounded-lg bg-muted border border-border flex mb-8 px-4 py-3 items-center gap-3">
            <Film className="text-primary size-5" />
            <div className="flex flex-1 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`rounded-sm flex-1 h-2 ${
                    i < completedSteps ? "bg-primary/70" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              {completedSteps === 4
                ? "Ready"
                : `Step ${completedSteps + 1} of 4`}
            </span>
          </div>

          {/* Step Content */}
          <div className="flex flex-col flex-1 gap-6">
            {/* Step 1: Content Strategy */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm transition-all hover:border-primary/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 !mb-4">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Content Strategy
              </h3>
              <div className="pl-10 space-y-6">
                <Topic onHandleInputChange={onHandleInputChange} />
              </div>
            </div>

            {/* Step 2: Visual Style */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm transition-all hover:border-primary/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 !mb-4">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Visual Style
              </h3>
              <div className="pl-10">
                <VideoStyle onHandleInputChange={onHandleInputChange} />
              </div>
            </div>

            {/* Step 3: Audio & Captions */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm transition-all hover:border-primary/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 !mb-4">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Audio & Captions
              </h3>
              <div className="pl-10 space-y-8">
                <Voice onHandleInputChange={onHandleInputChange} />
                <div className="border-t border-border/40 my-4"></div>
                <Captions onHandleInputChange={onHandleInputChange} />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-end">
            <Button
              size="lg"
              className="w-full md:w-auto px-10 py-6 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
              disabled={loading}
              onClick={GenerateVideo}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <WandSparkles />
              )}
              Generate Video
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </section>

        {/* Preview Panel */}
        <div className="hidden md:block">
          <div className="sticky top-6">
            <Preview formData={formData} />
            <div className="text-muted-foreground text-xs text-center mt-4">
              9:16 preview
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateNewVideo;
