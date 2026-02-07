import { Button } from "@/components/ui/button";
import React from "react";
import Authentication from "./Authentication";

function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="py-24 px-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-2 drop-shadow-sm">
          AI Youtube Short Video Generator
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
          🤖 AI instantly generates scripts, images, and voiceovers, so you can
          edit, enhance, and publish effortlessly! ⚡🚀
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button variant="secondary" size="lg" className="h-12 px-8 text-base transition-transform hover:scale-105 active:scale-95">Explore</Button>
          <Authentication>
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95">Get Started</Button>
          </Authentication>
        </div>
      </div>
    </div>
  );
}

export default Hero;
