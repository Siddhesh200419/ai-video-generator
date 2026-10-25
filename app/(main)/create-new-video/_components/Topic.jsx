"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
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



  // Build the topic that is saved and sent everywhere
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

  const handleCustomTopicChange = (val) => {
    setCustomTopic(val);
    onHandleInputChange("topic", buildTopic(selectTopic, val, title));
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    onHandleInputChange("title", val);
    onHandleInputChange("topic", buildTopic(selectTopic, customTopic, val));
  };

  const GenerateScript = async () => {
    if (user && user?.credits <= 0) {
      toast.error("Please add more credits to generate scripts.");
      return;
    }
    // const finalTopic = customTopic.trim();
    // const finalTheme = selectTopic.trim();

    // if (!finalTopic && !finalTheme) {
    //   toast.error("Please select a theme or enter your video topic!");
    //   return;
    // }

    // setLoading(true);
    // setSelectedScriptIndex(null);

    const finalTopic = customTopic.trim() || title.trim();
    const finalTheme = selectTopic.trim();

    if (!finalTopic && !finalTheme) {
      toast.error("Please enter a title, a topic, or select a theme!");
      return;
    }

    setLoading(true);
    setSelectedScriptIndex(null);
    setScripts([]);                          // clear old options
    onHandleInputChange("script", undefined); // clear the old selected script

    try {
      const result = await axios.post("/api/generate-script", {
        topic: finalTopic,
        theme: finalTheme,
      });

      const generated = result.data?.scripts || [];
      if (generated.length === 0) {
        toast.error("Could not generate scripts. Please try a different topic.");
      } else {
        setScripts(generated);
        toast.success("Scripts generated! Choose your favorite below.");
      }
    } catch (e) {
      console.error("Error generating script:", e);
      toast.error(e?.response?.data?.error || "Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div>
        <label className="text-sm font-semibold text-foreground">Project Title</label>
        <Input
          className="mt-1.5"
          placeholder="e.g. Secrets of the Deep Sea"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      {/* Theme / Category */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Video Theme / Genre</label>
          {selectTopic && (
            <span className="text-xs text-primary font-medium">
              Selected: {selectTopic}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Describe what the video is about. If you leave this blank, your project title is used as the topic.
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
                className={`text-xs transition-all ${isSelected
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

      {/* Specific Topic / Story details */}
      <div>
        <label className="text-sm font-semibold text-foreground">
          Custom Topic or Story Idea
        </label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Enter what you want the video to be about (or leave blank to auto-create a story for the chosen theme)
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
        {loading ? "Generating Relevant Scripts..." : "Generate Script"}
      </Button>

      {/* Generated Scripts Display */}
      {scripts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/40">
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
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 relative ${isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                    : "border-border/60 hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  onClick={() => {
                    setSelectedScriptIndex(index);
                    onHandleInputChange("script", item?.content);
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
                    {item?.content}
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

