"use client";
import React from "react";
import Link from "next/link";
import { Check, Film, Save } from "lucide-react";
import { useAuthContext } from "@/app/provider";
import toast from "react-hot-toast";

const STEPS = [
  { step: 1, title: "Script", path: "/script-step" },
  { step: 2, title: "Voice", path: "/voice-step" },
  { step: 3, title: "Captions", path: "/captions-step" },
  { step: 4, title: "Theme", path: "/theme-step" },
  { step: 5, title: "Review", path: "/review-step" },
];

export function StepHeader() {
  const { user } = useAuthContext();
  const handleSaveDraft = () => {
    toast.success("Draft saved automatically!");
  };

  return (
    <header className="border-b border-b-border flex px-6 md:px-8 justify-between items-center h-16 bg-background">
      <Link href="/my-videos" className="flex items-center gap-3">
        <div className="rounded-lg bg-primary text-primary-foreground flex justify-center items-center size-8">
          <Film className="size-4" />
        </div>
        <span className="font-semibold text-lg tracking-tight">ReelForge</span>
      </Link>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="font-medium transition-colors rounded-md bg-card text-muted-foreground text-sm border border-border inline-flex px-3 items-center gap-2 h-9 hover:bg-accent hover:text-foreground active:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Save className="size-4" />
          Save draft
        </button>
        <Link href="/dashboard">
          <div
            aria-label="Open account menu"
            className="font-semibold rounded-full bg-primary text-primary-foreground text-sm flex justify-center items-center size-9"
          >
            {user?.name?.slice(0, 2)?.toUpperCase() || "RF"}
          </div>
        </Link>
      </div>
    </header>
  );
}

export function StepNav({ currentStep }) {
  return (
    <nav
      aria-label="Create flow steps"
      className="border-b border-b-border flex px-4 md:px-8 py-5 justify-center items-center bg-background"
    >
      <ol className="flex justify-between items-center w-full max-w-3xl">
        {STEPS.map((s, index) => {
          const isDone = s.step < currentStep;
          const isActive = s.step === currentStep;
          return (
            <React.Fragment key={s.step}>
              <li className="flex items-center gap-2">
                <Link
                  href={s.path}
                  className={`text-sm flex items-center gap-2 ${
                    isActive
                      ? "font-semibold text-primary"
                      : isDone
                      ? "font-medium text-primary hover:opacity-80"
                      : "font-medium text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`rounded-full flex justify-center items-center size-7 text-xs font-semibold ${
                      isActive || isDone
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="size-4" /> : s.step}
                  </span>
                  <span className="hidden sm:inline">{s.title}</span>
                </Link>
              </li>
              {index < STEPS.length - 1 && (
                <li
                  className={`mx-2 md:mx-3 flex-1 h-px ${
                    s.step < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

