"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Film,
  Loader2Icon,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { StepHeader, StepNav } from "@/components/creation/StepNav";
import LivePreview from "@/components/creation/LivePreview";
import { useCreationContext } from "@/_context/CreationContext";
import axios from "axios";
import toast from "react-hot-toast";

const genres = [
  "Mystery",
  "Motivation",
  "Facts",
  "Story",
  "Tech",
  "History",
  "Science",
];

export default function ScriptStep() {
  const router = useRouter();
  const { formData, updateFormData } = useCreationContext();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateScripts = async () => {
    if (loading) return;
    const finalTopic = formData.topic?.trim() || formData.title?.trim();
    const finalTheme = formData.theme?.trim() || "Facts";

    if (!finalTopic && !finalTheme) {
      toast.error("Please enter a topic or select a genre!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await axios.post("/api/generate-script", {
        topic: finalTopic,
        theme: finalTheme,
      });

      const generated = result.data?.scripts;

      if (
        !Array.isArray(generated) ||
        generated.length < 1 ||
        generated.some((item) => !item?.content?.trim())
      ) {
        throw new Error("Could not generate scripts for this angle. Try again.");
      }

      updateFormData("scripts", generated);
      updateFormData("script", generated[0].content);
      updateFormData("selectedScriptIndex", 0);
      toast.success("Scripts generated! Choose your preferred option.");
    } catch (err) {
      console.error("Error generating script:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "We couldn't generate that angle. Try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScript = (content, index) => {
    updateFormData("script", content);
    updateFormData("selectedScriptIndex", index);
    toast.success(`Option ${index + 1} selected`);
  };

  const handleCopyScript = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Script copied to clipboard!");
  };

  const handleContinue = () => {
    if (!formData.script) {
      toast.error("Please select or enter a script before continuing");
      return;
    }
    router.push("/voice-step");
  };

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <StepHeader />
      <StepNav currentStep={1} />

      <main className="grid px-6 md:px-10 py-8 flex-1 gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] max-w-7xl mx-auto w-full">
        <section className="rounded-xl bg-card border border-border flex p-6 flex-col min-w-0 shadow-sm">
          {/* Progress Header */}
          <div className="rounded-lg bg-muted border border-border flex mb-8 px-4 py-3 items-center gap-3">
            <Film className="text-primary size-5" />
            <div className="flex flex-1 gap-2">
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              Script setup
            </span>
          </div>

          <div className="flex flex-col flex-1 gap-6">
            {/* Input prompt */}
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold text-2xl tracking-tight !mb-0">
                What should this Short be about?
              </h1>
              <textarea
                value={formData.topic || ""}
                onChange={(e) => {
                  updateFormData("topic", e.target.value);
                  if (!formData.title) updateFormData("title", e.target.value);
                }}
                placeholder="e.g. Why do some songs get stuck in your head?"
                className="resize-none rounded-lg bg-card text-foreground text-base border border-input outline-none p-4 min-h-24 focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-muted-foreground text-sm">
                Be specific or stay broad — we’ll find the angle.
              </span>
            </div>

            {/* Genre tags */}
            <div className="flex flex-col gap-3">
              <span className="font-medium text-sm">Choose a genre</span>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => updateFormData("theme", genre)}
                    className={`font-medium rounded-md text-xs px-3.5 py-2 transition-all border ${
                      formData.theme === genre
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Script Action */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerateScripts}
                className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {loading ? "Generating..." : "Generate scripts"}
              </button>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/40 flex px-3 py-2 items-center gap-2">
                <TriangleAlert className="size-4" />
                {errorMsg}
              </div>
            )}

            {/* Generated Scripts Display */}
            {formData.scripts?.length > 0 && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-2">
                {formData.scripts.map((item, index) => {
                  const isSelected = formData.selectedScriptIndex === index;
                  const wordCount = item.content.split(/\s+/).filter(Boolean).length;
                  const estSeconds = Math.round(wordCount / 2.5);

                  return (
                    <article
                      key={index}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className="flex mb-3 justify-between items-center">
                        <span className="font-semibold rounded-md bg-primary/10 text-primary text-xs px-2 py-1">
                          {index === 0 ? "Curiosity hook" : "Surprising fact"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {wordCount} words · ~{estSeconds} sec
                        </span>
                      </div>
                      <p className="text-sm leading-6 mb-5 text-foreground/90 whitespace-pre-wrap">
                        {item.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectScript(item.content, index)}
                          className={`font-semibold rounded-md text-xs px-3 py-2 transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(item.content)}
                          className="font-medium rounded-md text-xs border border-border px-3 py-2 hover:bg-accent inline-flex items-center gap-1"
                        >
                          <Copy className="size-3" />
                          Copy
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="flex mt-8 justify-between items-center pt-4 border-t border-border">
            <button
              type="button"
              className="font-medium rounded-md bg-card text-foreground text-sm border border-border inline-flex px-4 items-center gap-2 h-10 hover:bg-accent"
              onClick={() => router.push("/my-videos")}
            >
              Back
            </button>
            <button
              type="button"
              className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90"
              onClick={handleContinue}
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <LivePreview step={1} />
      </main>
    </div>
  );
}

