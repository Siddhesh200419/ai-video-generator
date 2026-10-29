"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Film } from "lucide-react";
import { StepHeader, StepNav } from "@/components/creation/StepNav";
import LivePreview from "@/components/creation/LivePreview";
import { useCreationContext } from "@/_context/CreationContext";

const captionStyles = [
  {
    name: "Bold word-by-word highlight",
    previewText: "ONE TINY",
    style: "text-yellow-400 text-3xl font-extrabold uppercase tracking-wide",
    badgeClass: "text-primary",
  },
  {
    name: "Karaoke",
    previewText: "ONE TINY",
    style:
      "text-white text-3xl font-bold italic drop-shadow-lg tracking-wide border-b-2 border-primary",
    badgeClass: "border-b-2 border-primary",
  },
  {
    name: "Minimal clean",
    previewText: "one tiny chorus",
    style: "text-white text-2xl font-light tracking-tight",
    badgeClass: "text-foreground",
  },
  {
    name: "Outline pop",
    previewText: "ONE TINY",
    style:
      "text-cyan-400 text-3xl font-black uppercase tracking-wider drop-shadow-md",
    badgeClass: "text-cyan-400",
  },
  {
    name: "Boxed",
    previewText: "ONE TINY",
    style:
      "bg-card text-foreground px-2 py-0.5 rounded text-2xl font-extrabold uppercase",
    badgeClass: "bg-card text-foreground px-1 py-0.5 rounded",
  },
  {
    name: "Fire",
    previewText: "FIRE CHORUS",
    style:
      "text-red-500 text-3xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent",
    badgeClass: "text-red-500",
  },
  {
    name: "Neon",
    previewText: "NEON POP",
    style:
      "text-green-500 text-3xl font-extrabold uppercase tracking-wide border border-green-300 px-1",
    badgeClass: "text-green-500",
  },
  {
    name: "Retro",
    previewText: "RETRO CHORUS",
    style: "text-amber-500 text-3xl font-bold tracking-tight font-mono",
    badgeClass: "text-amber-500",
  },
];

const highlightColors = [
  { name: "Coral", color: "#f97316" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Yellow", color: "#eab308" },
  { name: "White", color: "#ffffff" },
];

export default function CaptionsStep() {
  const router = useRouter();
  const { formData, updateFormData } = useCreationContext();

  const handleSelectStyle = (item) => {
    updateFormData("caption", {
      ...formData.caption,
      name: item.name,
      style: item.style,
    });
  };

  const handlePositionChange = (pos) => {
    updateFormData("caption", {
      ...formData.caption,
      position: pos,
    });
  };

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <StepHeader />
      <StepNav currentStep={3} />

      <main className="grid px-6 md:px-10 py-8 flex-1 gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] max-w-7xl mx-auto w-full">
        <section className="rounded-xl bg-card border border-border flex p-6 flex-col min-w-0 shadow-sm">
          {/* Progress Header */}
          <div className="rounded-lg bg-muted border border-border flex mb-8 px-4 py-3 items-center gap-3">
            <Film className="text-primary size-5" />
            <div className="flex flex-1 gap-2">
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              Caption setup
            </span>
          </div>

          <div className="flex flex-col flex-1 gap-8">
            <div>
              <h1 className="font-semibold text-2xl tracking-tight !mb-0">
                Give every word a moment.
              </h1>
              <p className="text-muted-foreground text-sm mt-2 !mt-1">
                Choose a style that makes your captions impossible to miss.
              </p>
            </div>

            {/* Caption Style Cards */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {captionStyles.map((item) => {
                const isSelected = formData.caption?.name === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectStyle(item)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="font-bold rounded-md bg-foreground text-card text-xs flex justify-center items-center aspect-video p-2">
                      <span className={item.badgeClass}>{item.previewText}</span>
                    </div>
                    <span className="font-semibold text-xs block mt-3 line-clamp-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Customization controls */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 pt-4 border-t border-border">
              {/* Font */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Font family</label>
                <select
                  value={formData.caption?.font || "Bricolage Grotesque"}
                  onChange={(e) =>
                    updateFormData("caption", {
                      ...formData.caption,
                      font: e.target.value,
                    })
                  }
                  className="rounded-md bg-card text-foreground text-sm border border-input px-3 h-10"
                >
                  <option value="Bricolage Grotesque">Bricolage Grotesque</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Geist">Geist Mono</option>
                </select>
              </div>

              {/* Position */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Position</label>
                <div className="rounded-md border border-border grid p-1 grid-cols-3 h-10 items-center">
                  {["top", "middle", "bottom"].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handlePositionChange(pos)}
                      className={`capitalize text-xs font-medium py-1.5 rounded transition-all ${
                        (formData.caption?.position || "bottom") === pos
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight Color */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="font-semibold text-sm">Highlight color</label>
                <div className="flex items-center gap-3">
                  {highlightColors.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      aria-label={`${col.name} highlight`}
                      onClick={() =>
                        updateFormData("caption", {
                          ...formData.caption,
                          color: col.color,
                        })
                      }
                      style={{ backgroundColor: col.color }}
                      className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.caption?.color === col.color
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                          : "border-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex mt-8 justify-between items-center pt-4 border-t border-border">
            <button
              type="button"
              className="font-medium rounded-md bg-card text-foreground text-sm border border-border inline-flex px-4 items-center gap-2 h-10 hover:bg-accent"
              onClick={() => router.push("/voice-step")}
            >
              Back
            </button>
            <button
              type="button"
              className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90"
              onClick={() => router.push("/theme-step")}
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <LivePreview step={3} />
      </main>
    </div>
  );
}

