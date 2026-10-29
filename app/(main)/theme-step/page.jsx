"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Box,
  Camera,
  Cpu,
  Film,
  MessageSquare,
  Moon,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { StepHeader, StepNav } from "@/components/creation/StepNav";
import LivePreview from "@/components/creation/LivePreview";
import { useCreationContext } from "@/_context/CreationContext";

const themes = [
  { name: "Cinematic", image: "/cinematic.jpeg", icon: Film, bg: "bg-primary/20", iconColor: "text-primary" },
  { name: "Dark fantasy", image: "/cinematic.jpeg", icon: Moon, bg: "bg-secondary", iconColor: "text-secondary-foreground" },
  { name: "Anime", image: "/anime.jpeg", icon: Sparkles, bg: "bg-accent", iconColor: "text-accent-foreground" },
  { name: "Comic", image: "/gta.jpg", icon: MessageSquare, bg: "bg-muted", iconColor: "text-muted-foreground" },
  { name: "Realistic photo", image: "/realistic.jpeg", icon: Camera, bg: "bg-secondary", iconColor: "text-secondary-foreground" },
  { name: "Watercolor", image: "/watercolor.jpg", icon: Paintbrush, bg: "bg-accent", iconColor: "text-accent-foreground" },
  { name: "Cyberpunk", image: "/cyberpunk.jpeg", icon: Cpu, bg: "bg-primary/20", iconColor: "text-primary" },
  { name: "Minimal 3D", image: "/cartoon.jpeg", icon: Box, bg: "bg-muted", iconColor: "text-muted-foreground" },
];

const moods = ["None", "Lo-fi", "Pulse", "Dreamy", "Tense"];

export default function ThemeStep() {
  const router = useRouter();
  const { formData, updateFormData } = useCreationContext();

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <StepHeader />
      <StepNav currentStep={4} />

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
              <span className="rounded-sm bg-border flex-1 h-2" />
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              Theme setup
            </span>
          </div>

          <div className="flex flex-col flex-1">
            <div className="mb-6">
              <h1 className="font-semibold text-2xl tracking-tight !mb-0">
                Choose the world your idea lives in.
              </h1>
              <p className="text-muted-foreground text-sm !mt-1">
                Select visual style and ambient soundscape for your video.
              </p>
            </div>

            {/* Theme Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                const isSelected =
                  formData.videoStyle?.toLowerCase() === theme.name.toLowerCase();

                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => updateFormData("videoStyle", theme.name)}
                    className={`text-left rounded-lg p-3 transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="rounded-md overflow-hidden relative mb-3 h-24">
                      <Image
                        src={theme.image}
                        alt={theme.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <IconComponent className="text-white size-8 drop-shadow" />
                      </div>
                    </div>
                    <span className="font-medium text-sm block truncate">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Set the mood */}
            <div className="mt-8 pt-6 border-t border-border">
              <h2 className="font-semibold text-base mb-3 !mb-3">Set the mood</h2>
              <div className="flex flex-wrap items-center gap-2.5">
                {moods.map((mood) => {
                  const isSelected = formData.mood === mood;
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => updateFormData("mood", mood)}
                      className={`font-medium rounded-md text-sm px-4 py-2 transition-all border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {mood}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex mt-8 justify-between items-center pt-4 border-t border-border">
            <button
              type="button"
              className="font-medium rounded-md bg-card text-foreground text-sm border border-border inline-flex px-4 items-center gap-2 h-10 hover:bg-accent"
              onClick={() => router.push("/captions-step")}
            >
              Back
            </button>
            <button
              type="button"
              className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90"
              onClick={() => router.push("/review-step")}
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <LivePreview step={4} />
      </main>
    </div>
  );
}

