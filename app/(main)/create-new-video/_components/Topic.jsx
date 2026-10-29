"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, SparklesIcon, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useAuthContext } from "@/app/provider";
import toast from "react-hot-toast";

const suggestions = [
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

function Topic({ onHandleInputChange }) {
  const [selectTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [title, setTitle] = useState("");
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const scriptsRef = useRef(null);

  useEffect(() => {
    if (scripts.length === 0) return;
    scriptsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [scripts]);

  // Build the topic that is saved and sent everywhere.
  const buildTopic = (theme, custom, ttl) => {
    const core = custom.trim() || ttl.trim();
    return theme && core ? `${theme}: ${core}` : core || theme;
  };

  const handleThemeClick = (theme) => {
    const nextTheme = selectTopic === theme ? "" : theme;

    setSelectedTopic(nextTheme);
    onHandleInputChange("topic", buildTopic(nextTheme, customTopic, title));
    onHandleInputChange("theme", nextTheme);
  };

  const handleCustomTopicChange = (value) => {
    setCustomTopic(value);
    onHandleInputChange("topic", buildTopic(selectTopic, value, title));
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    onHandleInputChange("title", value);
    onHandleInputChange("topic", buildTopic(selectTopic, customTopic, value));
  };

  const GenerateScript = async () => {
    // Prevent duplicate submissions.
    if (loading) return;

    const finalTopic = customTopic.trim() || title.trim();
    const finalTheme = selectTopic.trim();

    if (!finalTopic && !finalTheme) {
      toast.error("Please enter a title, a topic, or select a theme!");
      return;
    }

    setLoading(true);
    setSelectedScriptIndex(null);
    setScripts([]);

    // Clear the previously selected script.
    onHandleInputChange("script", undefined);

    try {
      const result = await axios.post("/api/generate-script", {
        topic: finalTopic,
        theme: finalTheme,
      });

      const generated = result.data?.scripts;

      // Validate the API response before displaying it.
      if (
        !Array.isArray(generated) ||
        generated.length !== 2 ||
        generated.some(
          (item) => typeof item?.content !== "string" || !item.content.trim(),
        )
      ) {
        throw new Error(
          "The AI did not return two valid scripts. Please try again.",
        );
      }

      setScripts(generated);
      toast.success("Two scripts generated! Choose your favorite below.");
    } catch (error) {
      console.error("Error generating scripts:", error);

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to generate scripts. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-2xl tracking-tight !mb-0">
          What should this Short be about?
        </h2>
        <Input
          className="mt-1.5 rounded-lg bg-card text-foreground text-base border border-input outline-none"
          placeholder="e.g. Secrets of the Deep Sea"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
        />
        <span className="text-muted-foreground text-sm">
          Be specific or stay broad — we&apos;ll find the angle.
        </span>
      </div>

      {/* Theme / Category */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Choose a genre</span>
          {selectTopic && (
            <span className="text-xs text-primary font-medium">
              Selected: {selectTopic}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => {
            const isSelected = suggestion === selectTopic;
            return (
              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                key={index}
                className={`text-xs transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleThemeClick(suggestion)}
              >
                {suggestion}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Specific Topic / Story Details */}
      <div>
        <label className="text-sm font-semibold text-foreground">
          Custom Topic or Story Idea
        </label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2 !mt-0">
          Enter what you want the video to be about (or leave blank to
          auto-create a story for the chosen theme).
        </p>
        <Textarea
          rows={3}
          value={customTopic}
          placeholder="e.g. The mysterious disappearance of Flight 19 in the Bermuda Triangle..."
          onChange={(event) => handleCustomTopicChange(event.target.value)}
          className="resize-none rounded-lg bg-card text-foreground text-base border border-input outline-none"
        />
      </div>

      {/* Generate Script Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          size="default"
          className="font-semibold rounded-md bg-primary text-primary-foreground text-sm gap-2 shadow-md"
          disabled={loading}
          onClick={GenerateScript}
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SparklesIcon className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate scripts"}
        </Button>
      </div>

      {/* Generated Scripts */}
      {scripts.length > 0 && (
        <div
          ref={scriptsRef}
          className="mt-4 scroll-mt-24 pt-4 border-t border-border/40"
        >
          <h3 className="text-base font-semibold text-foreground mb-1 !mb-1">
            Choose Your Voiceover Script
          </h3>
          <p className="text-xs text-muted-foreground mb-3 !mt-0">
            Click on a script to use it for your video:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.map((item, index) => {
              const isSelected = selectedScriptIndex === index;
              return (
                <article
                  key={index}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                      : "border-border/60 hover:border-primary/50 hover:bg-muted/40"
                  }`}
                  onClick={() => {
                    setSelectedScriptIndex(index);
                    onHandleInputChange("script", item.content);
                    toast.success(`Script ${index + 1} selected.`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedScriptIndex(index);
                      onHandleInputChange("script", item.content);
                    }
                  }}
                >
                  <div className="flex mb-3 justify-between items-center">
                    <span className="font-semibold rounded-md bg-primary/10 text-primary text-xs px-2 py-1">
                      {index === 0 ? "Curiosity hook" : "Surprising fact"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {item.content.split(/\s+/).length} words
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-3">
                    {item.content}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {isSelected ? "✓ Selected" : "Click to select"}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Topic;
