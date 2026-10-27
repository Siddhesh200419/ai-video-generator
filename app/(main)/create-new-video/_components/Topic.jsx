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
  "Historic Story",
  "Kids Story",
  "Movie Stories",
  "AI Innovations",
  "Space Mysteries",
  "Horror Stories",
  "Mythological Tales",
  "Tech Breakthroughs",
  "True Crime Stories",
  "Fantasy Adventures",
  "Science Experiments",
  "Motivational Stories",
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
      <div>
        <label className="text-sm font-semibold text-foreground">
          Project Title
        </label>

        <Input
          className="mt-1.5"
          placeholder="e.g. Secrets of the Deep Sea"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
        />
      </div>

      {/* Theme / Category */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Video Theme / Genre
          </label>

          {selectTopic && (
            <span className="text-xs text-primary font-medium">
              Selected: {selectTopic}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Describe what the video is about. If you leave this blank, your
          project title is used as the topic.
        </p>

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

        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Enter what you want the video to be about (or leave blank to
          auto-create a story for the chosen theme).
        </p>

        <Textarea
          rows={3}
          value={customTopic}
          placeholder="e.g. The mysterious disappearance of Flight 19 in the Bermuda Triangle..."
          onChange={(event) => handleCustomTopicChange(event.target.value)}
        />
      </div>

      {/* Generate Script Button */}
      <Button
        type="button"
        size="default"
        className="gap-2 shadow-md"
        disabled={loading}
        onClick={GenerateScript}
      >
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <SparklesIcon className="h-4 w-4" />
        )}

        {loading ? "Generating Relevant Scripts..." : "Generate Scripts"}
      </Button>

      {/* Generated Scripts */}
      {scripts.length > 0 && (
        <div
          ref={scriptsRef}
          className="mt-4 scroll-mt-24 pt-4 border-t border-border/40"
        >
          <h3 className="text-base font-semibold text-foreground mb-1">
            Choose Your Voiceover Script
          </h3>

          <p className="text-xs text-muted-foreground mb-3">
            Click on a script to use it for your video:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.map((item, index) => {
              const isSelected = selectedScriptIndex === index;

              return (
                <div
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Option {index + 1}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>

                  <p className="mt-3 text-xs text-primary font-medium">
                    {isSelected ? "Selected" : "Click to select"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Topic;
