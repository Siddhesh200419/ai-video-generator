"use client";
import React from "react";
import Authentication from "./Authentication";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  Captions,
  ChevronDown,
  LoaderCircle,
  Palette,
  PenLine,
  Zap,
} from "lucide-react";

function Hero() {
  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section className="relative px-10 py-20 overflow-hidden lg:p-24">
        <div className="pointer-events-none blur-3xl rounded-full bg-primary/10 absolute top-24 -left-24 size-96" />
        <div className="pointer-events-none blur-3xl rounded-full bg-primary/10 absolute top-12 right-24 size-96" />
        <div className="grid mx-auto items-center gap-12 max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 max-w-2xl">
            <div className="font-semibold rounded-full bg-accent/60 text-accent-foreground text-xs tracking-wide border border-accent inline-flex mb-6 px-3 py-1.5 items-center gap-2">
              <span className="rounded-full bg-primary size-2" />
              LIVE
            </div>
            <h1 className="font-bold text-foreground text-5xl tracking-tight max-w-2xl lg:text-6xl !mb-0">
              Turn one idea into a Short people actually finish.
            </h1>
            <p className="text-muted-foreground text-lg mt-6 max-w-xl !mt-6">
              ReelForge writes, voices, styles, and renders a ready-to-post
              YouTube Short in minutes.
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
                See an example
              </a>
            </div>
          </div>
          <div className="flex relative justify-center items-center min-h-[620px]">
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
              <div className="bg-gradient-to-b from-accent/30 via-foreground to-foreground absolute inset-0" />
              <div className="bg-gradient-to-br from-accent/30 via-primary/20 to-foreground/80 absolute inset-x-0 top-0 h-1/2" />
              <div className="rotate-12 blur-sm bg-foreground/80 absolute top-20 left-8 w-16 h-40" />
              <div className="-rotate-6 blur-sm bg-foreground/90 absolute top-28 right-4 w-12 h-56" />
              <div className="blur-sm bg-foreground/80 absolute bottom-24 left-4 w-24 h-32" />
              <div className="bg-gradient-to-t from-foreground via-foreground/70 to-transparent absolute inset-x-0 bottom-0 h-2/5" />
              <div className="font-bold text-center text-card text-2xl leading-tight tracking-tight absolute inset-x-4 bottom-28">
                <span>THE CITY </span>
                <span className="text-primary">NEVER </span>
                <span>SLEEPS</span>
              </div>
              <div className="rounded-full bg-card/30 absolute inset-x-4 bottom-12 h-1">
                <div className="rounded-full bg-primary w-3/5 h-1" />
              </div>
              <div className="font-mono text-card/80 text-xs flex absolute inset-x-4 bottom-5 justify-between items-center">
                <span>00:18 / 00:30</span>
                <span>REELFORGE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="bg-muted/40 border-y border-y-border px-10 py-20 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
              How it works
            </p>
            <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
              From spark to scroll-stopping.
            </h2>
          </div>
          <div className="grid mt-10 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-xs rounded-xl bg-card border-border p-6">
              <div className="font-bold text-primary text-4xl !mb-0">01</div>
              <h3 className="font-semibold text-xl mt-8 !mb-0">Idea</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Drop in a thought, topic, or rough outline.
              </p>
            </Card>
            <Card className="shadow-xs rounded-xl bg-card border-border p-6">
              <div className="font-bold text-primary text-4xl !mb-0">02</div>
              <h3 className="font-semibold text-xl mt-8 !mb-0">Script</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Get a tight script built for the first-second hook.
              </p>
            </Card>
            <Card className="shadow-xs rounded-xl bg-card border-border p-6">
              <div className="font-bold text-primary text-4xl !mb-0">03</div>
              <h3 className="font-semibold text-xl mt-8 !mb-0">Voice + style</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Choose a natural voice and a visual direction.
              </p>
            </Card>
            <Card className="shadow-xs rounded-xl bg-card border-border p-6">
              <div className="font-bold text-primary text-4xl !mb-0">04</div>
              <h3 className="font-semibold text-xl mt-8 !mb-0">Video</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Render a polished Short ready to post.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-10 py-20 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:items-end lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
                Built for momentum
              </p>
              <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
                Everything you need to keep creating.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl !mt-0">
              Skip the blank page and the editing rabbit hole. ReelForge
              handles the heavy lifting while you stay close to the idea.
            </p>
          </div>
          <div className="grid mt-12 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-xl border-border p-6">
              <PenLine className="text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">AI scripts</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Hooks, pacing, and punchlines shaped for short-form attention.
              </p>
            </Card>
            <Card className="rounded-xl border-border p-6">
              <AudioLines className="text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">Natural voices</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Warm, expressive narration that sounds like a real creator.
              </p>
            </Card>
            <Card className="rounded-xl border-border p-6">
              <Captions className="text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">Animated captions</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Make every word land with kinetic, readable subtitles.
              </p>
            </Card>
            <Card className="rounded-xl border-border p-6">
              <Palette className="text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">Visual themes</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Set a look that makes your next series feel unmistakably yours.
              </p>
            </Card>
            <Card className="rounded-xl border-border p-6">
              <Zap className="text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">One-click render</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Preview, polish, and export without opening a timeline.
              </p>
            </Card>
            <Card className="rounded-xl bg-muted border-border p-6">
              <LoaderCircle className="animate-spin text-primary size-6" />
              <h3 className="font-semibold text-lg mt-6 !mb-0">Rendering preview...</h3>
              <p className="text-muted-foreground text-sm mt-2 !mt-2">
                Your video is being assembled from script to screen.
              </p>
              <Button disabled={true} className="mt-6 w-full">
                Rendering
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section
        id="examples"
        className="bg-muted/40 border-y border-y-border px-10 py-20 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-end gap-8">
            <div>
              <p className="font-semibold uppercase text-primary text-sm tracking-widest !mt-0">
                Examples
              </p>
              <h2 className="font-bold text-4xl tracking-tight mt-3 !mb-0">
                Made to be watched all the way through.
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
            {[
              { cat: "SCIENCE", title: "Why octopuses are secretly brilliant", dur: "00:42", views: "2.4M views", from: "from-accent", via: "via-primary/50", to: "to-foreground" },
              { cat: "MINDSET", title: "The 30-second focus reset", dur: "00:30", views: "890K views", from: "from-primary/80", via: "via-foreground", to: "to-accent" },
              { cat: "SPACE", title: "A strange fact about Saturn", dur: "00:28", views: "1.1M views", from: "from-accent/80", via: "via-foreground/90", to: "to-primary/70" },
              { cat: "HISTORY", title: "The invention that changed mornings", dur: "00:36", views: "740K views", from: "from-primary/60", via: "via-accent", to: "to-foreground" },
              { cat: "NATURE", title: "How trees talk underground", dur: "00:44", views: "1.8M views", from: "from-foreground", via: "via-primary/70", to: "to-accent" },
              { cat: "CULTURE", title: "Why your favorite song feels familiar", dur: "00:33", views: "2.1M views", from: "from-accent", via: "via-foreground/80", to: "to-primary" },
            ].map((ex, i) => (
              <Card key={i} className="rounded-xl border-border overflow-hidden">
                <div className={`bg-gradient-to-br ${ex.from} ${ex.via} ${ex.to} p-6 aspect-[3/4]`}>
                  <span className="font-semibold rounded-full bg-card/80 text-card-foreground text-xs px-2 py-1">
                    {ex.cat}
                  </span>
                  <div className="flex items-end h-full">
                    <h3 className="font-bold text-card text-2xl !mb-0">{ex.title}</h3>
                  </div>
                </div>
                <div className="text-muted-foreground text-sm flex p-4 justify-between items-center">
                  <span>{ex.dur}</span>
                  <span>{ex.views}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-10 py-20 lg:px-24">
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
            {[
              { q: "What can I make with ReelForge?", a: "Ready-to-post vertical videos for YouTube Shorts and other short-form channels." },
              { q: "How long does a render take?", a: "Most Shorts are ready in a few minutes, depending on length and visual style." },
              { q: "Can I edit the result?", a: "Yes. Adjust the script, voice, captions, and visual theme before exporting." },
              { q: "Do I own what I create?", a: "Your finished videos are yours to publish and share." },
            ].map((faq, i) => (
              <details key={i} className="group border-b border-b-border">
                <summary className="font-semibold text-left text-lg flex py-6 justify-between items-center w-full cursor-pointer list-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="text-muted-foreground size-5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground -mt-2 pb-6 !mt-0">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center rounded-2xl bg-primary text-primary-foreground mx-10 mb-20 px-8 py-16 lg:mx-24">
        <h2 className="font-bold text-4xl tracking-tight !mb-0 text-primary-foreground">
          Your next Short starts with a sentence.
        </h2>
        <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl !mt-4">
          Bring the idea. ReelForge will take it from there.
        </p>
        <Authentication>
          <span className="font-semibold rounded-full bg-card text-card-foreground text-sm inline-flex mt-8 px-6 py-3 hover:bg-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            Start creating
          </span>
        </Authentication>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-t-border px-10 py-12 lg:px-24">
        <div className="grid mx-auto gap-8 max-w-7xl md:grid-cols-3">
          <div>
            <Link href="/" className="font-bold text-primary text-lg tracking-tight">
              ReelForge
            </Link>
            <p className="text-muted-foreground text-sm mt-4 !mt-4">
              Made for curious creators.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm !mb-0">Product</h3>
            <div className="text-muted-foreground text-sm flex mt-4 flex-col gap-2">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#how-it-works" className="hover:text-foreground">How it works</a>
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
