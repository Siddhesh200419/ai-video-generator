"use client";
import React from "react";
import Authentication from "./Authentication";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  Captions,
  Check,
  ChevronDown,
  Download,
  Layers,
  Palette,
  PenLine,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";

// The seven visual styles the create flow actually offers (see
// app/(main)/create-new-video/_components/VideoStyle.jsx).
const STYLES = [
  { name: "Realistic", image: "/realistic.jpeg" },
  { name: "Cinematic", image: "/cinematic.jpeg" },
  { name: "Anime", image: "/anime.jpeg" },
  { name: "Cyberpunk", image: "/cyberpunk.jpeg" },
  { name: "GTA", image: "/gta.jpg" },
  { name: "Watercolor", image: "/watercolor.jpeg" },
  { name: "Cartoon", image: "/cartoon.jpeg" },
];

// Matches the voice catalogue served by /api/voices.
const VOICES = [
  { name: "Grizzled Detective", detail: "Low, gravelly noir" },
  { name: "Meditation Guide", detail: "Airy & soothing" },
  { name: "Hype Announcer", detail: "Booming arena energy" },
  { name: "Regal Monarch", detail: "Poised & commanding" },
  { name: "Late-Night DJ", detail: "Smooth & velvety" },
  { name: "Cheeky Sidekick", detail: "Bright & playful" },
  { name: "Epic Narrator", detail: "Powerful & dramatic" },
  { name: "Mystical Seer", detail: "Wispy & ethereal" },
  { name: "Action Hero", detail: "Grit & determination" },
  { name: "Kind Storyteller", detail: "Warm & gentle" },
];

// A readable subset of the 15 caption treatments available in the create flow.
const CAPTION_STYLES = [
  { name: "Youtuber", style: "text-yellow-400 font-extrabold uppercase tracking-wide" },
  { name: "Neon", style: "text-green-500 font-extrabold uppercase tracking-wide" },
  { name: "Glitch", style: "text-pink-500 font-extrabold uppercase tracking-wide" },
  { name: "Fire", style: "text-red-500 font-extrabold uppercase tracking-wide" },
  { name: "Gaming", style: "text-purple-500 font-black uppercase tracking-wider" },
  { name: "Tech", style: "text-cyan-400 font-mono uppercase tracking-widest" },
  { name: "Retro", style: "text-amber-500 font-bold tracking-tight font-mono" },
  { name: "Vibrant", style: "text-rose-500 font-black uppercase tracking-wider" },
];

// The genres offered as one-tap starting points.
const GENRES = [
  "Mystery",
  "Motivation",
  "Facts",
  "Story",
  "Tech",
  "History",
  "Science",
  "Kids Story",
  "Movie Stories",
  "AI Innovations",
  "Space Mysteries",
  "Horror Stories",
];

// Example Shorts, each paired with a real style render from /public.
const EXAMPLES = [
  { genre: "Space Mysteries", title: "The signal we can't explain", style: "Cinematic", image: "/cinematic.jpeg", dur: "00:38" },
  { genre: "Tech", title: "How AI learned to see", style: "Cyberpunk", image: "/cyberpunk.jpeg", dur: "00:34" },
  { genre: "Science", title: "Why the ocean glows at night", style: "Realistic", image: "/realistic.jpeg", dur: "00:41" },
  { genre: "Motivation", title: "The five-minute reset", style: "Anime", image: "/anime.jpeg", dur: "00:29" },
  { genre: "Kids Story", title: "The fox who mapped the stars", style: "Cartoon", image: "/cartoon.jpeg", dur: "00:45" },
  { genre: "History", title: "A city lost to a single storm", style: "Watercolor", image: "/watercolor.jpeg", dur: "00:36" },
];

const PIPELINE = [
  { icon: Sparkles, label: "Idea" },
  { icon: PenLine, label: "Script" },
  { icon: AudioLines, label: "Voice" },
  { icon: Layers, label: "Scenes" },
  { icon: Type, label: "Captions" },
  { icon: Zap, label: "Render" },
];

const STEPS = [
  {
    n: "01",
    title: "Give it an idea",
    body: "Pick a genre like Space Mysteries or Horror Stories, or type your own topic and title.",
    tech: "Input",
  },
  {
    n: "02",
    title: "Pick a script",
    body: "Two 65–85 word hooks are written for your topic. Choose the one that lands hardest.",
    tech: "AI script writer",
  },
  {
    n: "03",
    title: "Set the look & voice",
    body: "Choose one of 7 visual styles, one of 10 voices, and a caption treatment you like.",
    tech: "AI narration",
  },
  {
    n: "04",
    title: "Get your Short",
    body: "A scene is generated for every line and stitched into a 9:16 video ready to download.",
    tech: "Scenes + render",
  },
];

const FEATURES = [
  {
    icon: PenLine,
    title: "Hook-first AI scripts",
    body: "Every topic produces two 65–85 word voiceover scripts written for short-form retention.",
  },
  {
    icon: AudioLines,
    title: "10 expressive voices",
    body: "From a grizzled detective to a hype announcer — audition each one before you commit.",
  },
  {
    icon: Captions,
    title: "Word-level captions",
    body: "Narration is transcribed word by word so captions land on the exact beat they're spoken.",
  },
  {
    icon: Layers,
    title: "A scene for every line",
    body: "Each beat of the script gets its own generated image, so nothing sits on a static frame.",
  },
  {
    icon: Palette,
    title: "7 visual styles",
    body: "Realistic, Cinematic, Anime, Cyberpunk, GTA, Watercolor, or Cartoon — your series, your look.",
  },
  {
    icon: Download,
    title: "One-click 9:16 export",
    body: "Preview the finished Short in a real player, then download the MP4 and post it.",
  },
];

const FAQS = [
  {
    q: "What exactly does ReelForge make?",
    a: "A finished, vertical 9:16 YouTube Short — script, AI voiceover, word-level captions, generated scenes, and a downloadable MP4 you can post right away.",
  },
  {
    q: "How long is each Short?",
    a: "Scripts are written to 65–85 words, which lands around 30–45 seconds of narration — the sweet spot for Shorts.",
  },
  {
    q: "Can I control how it looks and sounds?",
    a: "Yes. Before rendering you choose from 7 visual styles, 10 voices, and 15 caption treatments, and you pick which of the two generated scripts to use.",
  },
  {
    q: "Can I change things before it renders?",
    a: "The create flow is reviewable end to end — topic, script, style, voice, and captions are all set before the render job starts.",
  },
  {
    q: "Do I own what I create?",
    a: "Your finished videos are yours to publish and share.",
  },
];

function Hero() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative px-6 py-20 overflow-hidden md:px-10 lg:p-24">
        <div className="pointer-events-none blur-3xl rounded-full bg-primary/10 absolute top-24 -left-24 size-96" />
        <div className="pointer-events-none blur-3xl rounded-full bg-primary/10 absolute top-12 right-24 size-96" />
        <div className="grid mx-auto items-center gap-12 max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 max-w-2xl">
            <div className="font-semibold rounded-full bg-accent/60 text-accent-foreground text-xs tracking-wide border border-accent inline-flex mb-6 px-3 py-1.5 items-center gap-2">
              <Sparkles className="text-primary size-3.5" />
              AI YouTube Shorts generator
            </div>
            <h1 className="font-bold text-foreground text-5xl tracking-tight max-w-2xl lg:text-6xl !mb-0">
              Turn a topic into a finished YouTube Short.
            </h1>
            <p className="text-muted-foreground text-lg mt-6 max-w-xl !mt-6">
              ReelForge writes the script, records the narration, syncs
              word-by-word captions, generates a scene for every line, and
              renders a vertical video you can download and post.
            </p>
            <div className="flex mt-8 flex-wrap items-center gap-4">
              <Authentication>
                <span className="font-semibold shadow-sm rounded-full bg-primary text-primary-foreground text-sm px-6 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                  Start creating
                </span>
              </Authentication>
              <a
                href="#examples"
                className="font-semibold rounded-full bg-background text-foreground text-sm border border-border px-6 py-3 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
              >
                See examples
              </a>
            </div>
            <dl className="grid mt-10 gap-6 max-w-lg grid-cols-2 sm:grid-cols-4">
              {[
                { v: "7", l: "Visual styles" },
                { v: "10", l: "AI voices" },
                { v: "15", l: "Caption styles" },
                { v: "9:16", l: "Ready to post" },
              ].map((stat) => (
                <div key={stat.l}>
                  <dt className="font-bold text-2xl tracking-tight !mt-0">
                    {stat.v}
                  </dt>
                  <dd className="text-muted-foreground text-xs mt-1 !mt-1">
                    {stat.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Phone mockup showing a rendered Short */}
          <div className="flex relative justify-center items-center min-h-[560px]">
            <div
              aria-hidden="true"
              className="opacity-60 hidden absolute top-8 right-0 gap-2 lg:flex"
            >
              <span className="rounded-xs bg-primary/60 w-16 h-3" />
              <span className="rounded-xs bg-primary/30 w-16 h-3" />
              <span className="rounded-xs bg-primary/60 w-16 h-3" />
              <span className="rounded-xs bg-primary/30 w-16 h-3" />
            </div>
            <div
              aria-hidden="true"
              className="opacity-60 hidden absolute bottom-8 left-0 gap-2 lg:flex"
            >
              <span className="rounded-xs bg-primary/30 w-16 h-3" />
              <span className="rounded-xs bg-primary/60 w-16 h-3" />
              <span className="rounded-xs bg-primary/30 w-16 h-3" />
              <span className="rounded-xs bg-primary/60 w-16 h-3" />
            </div>
            <div className="shadow-2xl rounded-3xl bg-foreground border-8 border-foreground relative w-72 aspect-[9/16] overflow-hidden">
              <Image
                src="/cinematic.jpeg"
                alt="A Short generated with the Cinematic style"
                fill
                sizes="288px"
                priority
                className="object-cover"
              />
              <div className="bg-gradient-to-t from-black/85 via-black/20 to-black/40 absolute inset-0" />
              <div className="rounded-full bg-white/20 absolute inset-x-4 top-5 h-1">
                <div className="rounded-full bg-white w-2/5 h-1" />
              </div>
              <div className="font-bold text-center text-white text-2xl leading-tight tracking-tight absolute inset-x-4 bottom-28">
                <span>THE SIGNAL </span>
                <span className="text-yellow-400">WE CAN&apos;T </span>
                <span>EXPLAIN</span>
              </div>
              <div className="rounded-full bg-white/25 absolute inset-x-4 bottom-12 h-1">
                <div className="rounded-full bg-white w-3/5 h-1" />
              </div>
              <div className="font-mono text-white/80 text-xs flex absolute inset-x-4 bottom-5 justify-between items-center">
                <span>00:15 / 00:38</span>
                <span>CINEMATIC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIPELINE STRIP ── */}
      <section
        aria-label="Generation pipeline"
        className="bg-muted/40 border-y border-y-border px-6 py-6 md:px-10 lg:px-24"
      >
        <ol className="flex flex-wrap mx-auto gap-x-3 gap-y-4 max-w-7xl justify-center items-center">
          {PIPELINE.map((step, i) => (
            <React.Fragment key={step.label}>
              <li className="text-muted-foreground text-sm flex items-center gap-2">
                <step.icon className="text-primary size-4" />
                <span className="font-medium text-foreground">{step.label}</span>
              </li>
              {i < PIPELINE.length - 1 && (
                <li aria-hidden="true" className="text-muted-foreground/50 text-sm">
                  →
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-6 py-20 md:px-10 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
              How it works
            </p>
            <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
              Four steps from idea to upload.
            </h2>
          </div>
          <div className="grid mt-10 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Card key={step.n} className="shadow-xs rounded-xl bg-card border-border p-6">
                <div className="font-bold text-primary text-4xl !mb-0">{step.n}</div>
                <h3 className="font-semibold text-xl mt-8 !mb-0">{step.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 !mt-2">
                  {step.body}
                </p>
                <span className="font-medium rounded-full bg-muted text-muted-foreground text-xs inline-block mt-4 px-2.5 py-1">
                  {step.tech}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISUAL STYLES ── */}
      <section
        id="styles"
        className="bg-muted/40 border-y border-y-border px-6 py-20 md:px-10 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:items-end lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
                Visual styles
              </p>
              <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
                Seven worlds to tell it in.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl !mt-0">
              Every style runs through the same pipeline — only the look changes.
              Pick one and your whole Short keeps a consistent art direction from
              the first scene to the last.
            </p>
          </div>
          <div className="grid mt-10 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {STYLES.map((style) => (
              <div
                key={style.name}
                className="group rounded-xl border border-border overflow-hidden bg-card"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={style.image}
                    alt={`${style.name} visual style`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex px-4 py-3 justify-between items-center">
                  <span className="font-medium text-sm">{style.name}</span>
                  <Palette className="text-muted-foreground size-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOICES + CAPTIONS ── */}
      <section id="voices" className="px-6 py-20 md:px-10 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
              Voice & captions
            </p>
            <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
              Sound like a creator, not a robot.
            </h2>
          </div>

          <div className="grid mt-10 gap-10 lg:grid-cols-2">
            {/* Voices */}
            <div>
              <div className="flex mb-5 items-center gap-2">
                <AudioLines className="text-primary size-5" />
                <h3 className="font-semibold text-lg !mb-0">10 narration voices</h3>
              </div>
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {VOICES.map((voice) => (
                  <div
                    key={voice.name}
                    className="flex bg-card px-4 py-3 justify-between items-center gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate !mt-0">
                        {voice.name}
                      </p>
                      <p className="text-muted-foreground text-xs truncate !mt-0">
                        {voice.detail}
                      </p>
                    </div>
                    <div aria-hidden="true" className="flex items-center gap-1 shrink-0">
                      <span className="rounded-full bg-primary w-1 h-2" />
                      <span className="rounded-full bg-primary w-1 h-4" />
                      <span className="rounded-full bg-primary w-1 h-6" />
                      <span className="rounded-full bg-primary w-1 h-3" />
                      <span className="rounded-full bg-primary w-1 h-5" />
                      <span className="rounded-full bg-primary w-1 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Captions */}
            <div>
              <div className="flex mb-5 items-center gap-2">
                <Type className="text-primary size-5" />
                <h3 className="font-semibold text-lg !mb-0">
                  15 caption treatments
                </h3>
              </div>
              <div className="rounded-xl bg-foreground p-6">
                <p className="text-white/60 text-xs uppercase tracking-widest !mt-0">
                  Pick a treatment
                </p>
                <div className="flex flex-wrap mt-4 gap-3">
                  {CAPTION_STYLES.map((caption) => (
                    <span
                      key={caption.name}
                      className={`rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-lg ${caption.style}`}
                    >
                      {caption.name}
                    </span>
                  ))}
                </div>
                <p className="text-white/60 text-sm mt-6 !mt-6">
                  Plus Minimalist, Elegant, Classic, Luxury, Modern, Superme and
                  Futuristic — captions time to the exact word spoken.
                </p>
              </div>
              <ul className="flex flex-col mt-6 gap-3">
                {[
                  "Word-by-word timing from the narration audio",
                  "Readable on any background, at any speed",
                  "Swap the treatment without re-rendering the voice",
                ].map((item) => (
                  <li key={item} className="text-muted-foreground text-sm flex gap-3 !mt-0">
                    <Check className="text-primary size-4 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="bg-muted/40 border-y border-y-border px-6 py-20 md:px-10 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
              What you get
            </p>
            <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
              The whole Short, handled.
            </h2>
            <p className="text-muted-foreground mt-4 !mt-4">
              Skip the blank page and the editing timeline. ReelForge runs the
              entire pipeline so you only make the creative calls.
            </p>
          </div>
          <div className="grid mt-12 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="rounded-xl border-border p-6">
                <feature.icon className="text-primary size-6" />
                <h3 className="font-semibold text-lg mt-6 !mb-0">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 !mt-2">
                  {feature.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section id="examples" className="px-6 py-20 md:px-10 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-end gap-8">
            <div>
              <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
                Examples
              </p>
              <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
                Every genre gets its own look.
              </h2>
            </div>
            <Authentication>
              <span className="font-semibold text-primary text-sm hidden hover:text-foreground md:inline-flex items-center cursor-pointer transition-colors">
                Make your own
                <ArrowUpRight className="inline size-4" />
              </span>
            </Authentication>
          </div>

          <div className="grid mt-10 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map((example) => (
              <Card
                key={example.title}
                className="rounded-xl border-border overflow-hidden p-0"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={example.image}
                    alt={`${example.title} — ${example.style} style`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="bg-gradient-to-t from-black/85 via-black/20 to-transparent absolute inset-0" />
                  <span className="font-semibold rounded-full bg-white/90 text-black text-xs absolute top-4 left-4 px-2.5 py-1">
                    {example.genre}
                  </span>
                  <div className="absolute inset-x-4 bottom-4">
                    <h3 className="font-bold text-white text-xl leading-tight !mb-0">
                      {example.title}
                    </h3>
                    <p className="text-white/70 text-xs mt-1 !mt-1">
                      {example.style} style
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground text-sm flex p-4 justify-between items-center">
                  <span>{example.dur}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="size-3.5" />
                    9:16 MP4
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <p className="font-semibold uppercase text-muted-foreground text-xs tracking-widest !mt-0">
              Start from any genre
            </p>
            <div className="flex flex-wrap mt-4 gap-2">
              {GENRES.map((genre) => (
                <span
                  key={genre}
                  className="font-medium rounded-full bg-card border border-border text-muted-foreground text-sm px-3.5 py-1.5"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/40 border-y border-y-border px-6 py-20 md:px-10 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
              FAQ
            </p>
            <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
              Questions, answered.
            </h2>
          </div>
          <div className="border-y border-y-border mt-10">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-b-border">
                <summary className="font-semibold text-left text-lg flex py-6 justify-between items-center w-full cursor-pointer list-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="text-muted-foreground size-5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground pb-6 !mt-0">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center rounded-2xl bg-primary text-primary-foreground mx-6 my-20 px-8 py-16 md:mx-10 lg:mx-24">
        <h2 className="font-bold text-4xl tracking-tight !mb-0 text-primary-foreground">
          Your next Short starts with one sentence.
        </h2>
        <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl !mt-4">
          Bring the idea. ReelForge writes, voices, captions, and renders it.
        </p>
        <Authentication>
          <span className="font-semibold rounded-full bg-card text-card-foreground text-sm inline-flex mt-8 px-6 py-3 hover:bg-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            Start creating
          </span>
        </Authentication>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-t-border px-6 py-12 md:px-10 lg:px-24">
        <div className="grid mx-auto gap-8 max-w-7xl md:grid-cols-3">
          <div>
            <Link href="/" className="font-bold text-primary text-lg tracking-tight">
              ReelForge
            </Link>
            <p className="text-muted-foreground text-sm mt-4 !mt-4">
              The AI YouTube Shorts generator.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm !mb-0">Product</h3>
            <div className="text-muted-foreground text-sm flex mt-4 flex-col gap-2">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#how-it-works" className="hover:text-foreground">How it works</a>
              <a href="#styles" className="hover:text-foreground">Visual styles</a>
              <a href="#voices" className="hover:text-foreground">Voices & captions</a>
              <a href="#examples" className="hover:text-foreground">Examples</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm !mb-0">Social</h3>
            <div className="text-muted-foreground text-sm flex mt-4 gap-4">
              <a href="#" className="hover:text-foreground">YouTube</a>
              <a href="#" className="hover:text-foreground">Instagram</a>
              <a href="#" className="hover:text-foreground">TikTok</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Hero;
