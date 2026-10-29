"use client";
import React from "react";
import Image from "next/image";
import { Disc3, Play } from "lucide-react";
import { useCreationContext } from "@/_context/CreationContext";

const styleImages = {
  Realistic: "/realistic.jpeg",
  Cinematic: "/cinematic.jpeg",
  Anime: "/anime.jpeg",
  Cyberpunk: "/cyberpunk.jpeg",
  GTA: "/gta.jpg",
  Watercolor: "/watercolor.jpg",
  cartoon: "/cartoon.jpeg",
  "Realistic photo": "/realistic.jpeg",
  "Dark fantasy": "/cinematic.jpeg",
  Comic: "/gta.jpg",
  "Minimal 3D": "/cartoon.jpeg",
};

export default function LivePreview({ step = 1 }) {
  const { formData } = useCreationContext();
  const selectedImage = styleImages[formData.videoStyle] || "/cinematic.jpeg";

  return (
    <aside className="flex sticky top-6 flex-col items-center gap-4 h-fit">
      <div className="rounded-2xl bg-foreground border border-border flex relative justify-center items-center w-full max-w-[320px] aspect-[9/16] overflow-hidden shadow-lg">
        {formData.videoStyle && selectedImage ? (
          <>
            <Image
              src={selectedImage}
              alt="Preview"
              fill
              className="object-cover transition-opacity duration-300"
            />
            <div className="bg-gradient-to-t from-black/80 via-black/20 to-black/40 absolute inset-0" />
          </>
        ) : (
          <div className="bg-foreground flex absolute inset-0 flex-col justify-center items-center gap-6">
            <Disc3 className="text-muted-foreground size-28 animate-spin-slow" />
            <div className="text-center rounded-md bg-card/50 text-card-foreground text-sm px-4 py-2 max-w-[80%]">
              {formData.title || "Your video preview"}
            </div>
          </div>
        )}

        {/* LIVE badge */}
        <span className="font-bold rounded-full bg-accent text-accent-foreground text-xs absolute top-4 right-4 px-3 py-1">
          LIVE
        </span>

        {/* Center / Body text */}
        <div className="text-center px-6 absolute inset-x-0 top-1/3">
          <p className="text-card/90 font-medium text-sm line-clamp-3 drop-shadow-md">
            {formData.script
              ? formData.script.substring(0, 80) + "..."
              : formData.topic
              ? formData.topic
              : "Why do some songs get stuck in your head?"}
          </p>
        </div>

        {/* Step-specific overlay: Voice waveform */}
        {step === 2 && formData.voice && (
          <div className="absolute inset-x-4 bottom-24 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-primary w-1 h-2" />
              <span className="rounded-full bg-primary w-1 h-4 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-6 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-3 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-5 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-3 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-6 animate-pulse" />
              <span className="rounded-full bg-primary w-1 h-2" />
            </div>
            <div className="font-medium text-center rounded-lg bg-card/90 text-foreground text-xs border border-border px-3 py-1.5 backdrop-blur-sm">
              {formData.voice} · {formData.voiceSpeed || 1.0}x
            </div>
          </div>
        )}

        {/* Captions Preview */}
        <div
          className={`absolute inset-x-4 ${
            formData.caption?.position === "top"
              ? "top-14"
              : formData.caption?.position === "middle"
              ? "top-1/2 -translate-y-1/2"
              : "bottom-12"
          }`}
        >
          <div className="font-bold text-center text-primary-foreground text-xl tracking-tight leading-tight drop-shadow-lg">
            <span
              className={
                formData.caption?.style ||
                "text-yellow-400 font-extrabold uppercase"
              }
            >
              ONE TINY
            </span>{" "}
            <span>CHORUS</span>
          </div>
        </div>

        {/* Progress bar on bottom */}
        <div className="rounded-full bg-card/30 absolute inset-x-4 bottom-4 h-1">
          <div className="rounded-full bg-primary w-3/5 h-1" />
        </div>
      </div>
      <div className="text-muted-foreground text-xs">9:16 preview</div>
    </aside>
  );
}

