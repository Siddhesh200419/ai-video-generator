"use client";
import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const STEPS = [
  { step: 1, title: "Script", path: "/script-step" },
  { step: 2, title: "Voice", path: "/voice-step" },
  { step: 3, title: "Theme", path: "/theme-step" },
  { step: 4, title: "Captions", path: "/captions-step" },
  { step: 5, title: "Review", path: "/review-step" },
];

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

