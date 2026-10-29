"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Film, Loader2, Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { StepHeader, StepNav } from "@/components/creation/StepNav";
import LivePreview from "@/components/creation/LivePreview";
import { useCreationContext } from "@/_context/CreationContext";
import axios from "axios";
import toast from "react-hot-toast";

const voiceFilters = ["All", "Warm", "Deep", "Calm", "Energetic", "Dramatic"];

const defaultVoices = [
  { id: "Nova", name: "Nova", description: "Warm", category: "Warm" },
  { id: "Atlas", name: "Atlas", description: "Deep", category: "Deep" },
  { id: "River", name: "River", description: "Calm", category: "Calm" },
  { id: "Sol", name: "Sol", description: "Energetic", category: "Energetic" },
  { id: "Echo", name: "Echo", description: "Dramatic", category: "Dramatic" },
  { id: "Luna", name: "Luna", description: "Warm & Gentle", category: "Warm" },
];

export default function VoiceStep() {
  const router = useRouter();
  const { formData, updateFormData } = useCreationContext();
  const [voices, setVoices] = useState(defaultVoices);
  const [activeFilter, setActiveFilter] = useState("All");
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await axios.get("/api/voices");
      if (response.data?.voices?.length > 0) {
        setVoices(response.data.voices);
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (e, voice) => {
    e.stopPropagation();

    if (previewingVoice === voice.id) {
      if (audio) audio.pause();
      setPreviewingVoice(null);
      return;
    }

    if (audio) audio.pause();

    if (!voice.sampleUrl) {
      toast("Voice selected — live previews disabled to conserve TTS quota");
      updateFormData("voice", voice.name || voice.id);
      return;
    }

    setPreviewingVoice(voice.id);
    const newAudio = new Audio(voice.sampleUrl);
    setAudio(newAudio);
    newAudio.play();
    newAudio.onended = () => setPreviewingVoice(null);
  };

  const filteredVoices = voices.filter((v) => {
    if (activeFilter === "All") return true;
    const cat = v.category || v.description || "";
    return cat.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <StepHeader />
      <StepNav currentStep={2} />

      <main className="grid px-6 md:px-10 py-8 flex-1 gap-8 lg:gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] max-w-7xl mx-auto w-full">
        <section className="rounded-xl bg-card border border-border flex p-6 flex-col min-w-0 shadow-sm">
          {/* Progress Header */}
          <div className="rounded-lg bg-muted border border-border flex mb-8 px-4 py-3 items-center gap-3">
            <Film className="text-primary size-5" />
            <div className="flex flex-1 gap-2">
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-primary/70 flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
              <span className="rounded-sm bg-border flex-1 h-2" />
            </div>
            <span className="font-medium uppercase text-muted-foreground text-xs tracking-wider">
              Voice setup
            </span>
          </div>

          <div className="flex flex-col flex-1 gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="font-semibold text-2xl tracking-tight !mb-0">
                  Find the right read.
                </h1>
                <p className="text-muted-foreground text-sm !mt-1">
                  Choose a natural voice for your narrator.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {voiceFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`font-medium rounded-md text-xs px-3 py-1.5 transition-all border ${
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Voices Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {filteredVoices.map((voice) => {
                  const isSelected =
                    formData.voice === voice.name || formData.voice === voice.id;
                  return (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => updateFormData("voice", voice.name || voice.id)}
                      className={`text-left rounded-xl border p-4 transition-all flex flex-col justify-between gap-4 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <div className="font-semibold text-base">
                            {voice.name || voice.id}
                          </div>
                          <div className="text-muted-foreground text-sm mt-0.5">
                            {voice.description || "Narrator"}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Play ${voice.name || voice.id}`}
                          onClick={(e) => handlePreview(e, voice)}
                          className="rounded-full bg-secondary text-secondary-foreground flex justify-center items-center size-9 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                        >
                          {previewingVoice === voice.id ? (
                            <Pause className="size-4" />
                          ) : (
                            <Play className="size-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="rounded-full bg-primary w-1 h-2" />
                        <span className="rounded-full bg-primary w-1 h-3" />
                        <span className="rounded-full bg-primary w-1 h-5" />
                        <span className="rounded-full bg-primary w-1 h-3" />
                        <span className="rounded-full bg-primary w-1 h-4" />
                        <span className="rounded-full bg-primary w-1 h-2" />
                        <span className="rounded-full bg-primary w-1 h-5" />
                        <span className="rounded-full bg-primary w-1 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Speed slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">Playback speed</span>
                <span className="font-mono text-sm text-primary font-medium">
                  {formData.voiceSpeed || 1.0}x
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-xs text-muted-foreground">0.8x</span>
                <Slider
                  min={0.8}
                  max={1.2}
                  step={0.1}
                  value={[formData.voiceSpeed || 1.0]}
                  onValueChange={(val) => updateFormData("voiceSpeed", val[0])}
                  className="flex-1"
                />
                <span className="font-medium text-xs text-muted-foreground">1.2x</span>
              </div>
            </div>

            {/* Sample phrase card */}
            <div className="rounded-lg bg-card border border-border p-5 shadow-xs">
              <p className="text-foreground text-base leading-7 italic !mt-0">
                &ldquo;
                {formData.script
                  ? formData.script.split(".")[0] + "..."
                  : "Ever wonder why one tiny chorus can loop in your brain for hours?"}
                &rdquo;
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex mt-8 justify-between items-center pt-4 border-t border-border">
            <button
              type="button"
              className="font-medium rounded-md bg-card text-foreground text-sm border border-border inline-flex px-4 items-center gap-2 h-10 hover:bg-accent"
              onClick={() => router.push("/script-step")}
            >
              Back
            </button>
            <button
              type="button"
              className="font-semibold rounded-md bg-primary text-primary-foreground text-sm inline-flex px-5 items-center gap-2 h-10 hover:bg-primary/90"
              onClick={() => router.push("/captions-step")}
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>

        <LivePreview step={2} />
      </main>
    </div>
  );
}

