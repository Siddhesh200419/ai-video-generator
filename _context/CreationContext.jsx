"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export const CreationContext = createContext();

const STORAGE_KEY = "reelforge_creation_data";

const initialData = {
  title: "",
  topic: "",
  theme: "",
  customTopic: "",
  script: "",
  scripts: [],
  selectedScriptIndex: null,
  voice: "",
  voiceSpeed: 1.0,
  caption: null,
  videoStyle: "",
  mood: "",
  filmGrain: false,
};

export function CreationProvider({ children }) {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.title === "w" || parsed.title === "W") {
            parsed.title = parsed.topic || "";
          }
          return { ...initialData, ...parsed };
        }
      } catch (e) {
        console.error("Error reading saved creation data", e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const hasContent = Boolean(
          formData.title?.trim() ||
          formData.topic?.trim() ||
          formData.script?.trim() ||
          formData.voice ||
          formData.videoStyle ||
          (formData.scripts && formData.scripts.length > 0)
        );

        if (hasContent) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Error saving creation data", e);
      }
    }
  }, [formData]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFormData = () => {
    setFormData(initialData);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error("Error clearing saved creation data", e);
      }
    }
  };

  return (
    <CreationContext.Provider
      value={{
        formData,
        setFormData,
        updateFormData,
        resetFormData,
      }}
    >
      {children}
    </CreationContext.Provider>
  );
}

export const useCreationContext = () => {
  const context = useContext(CreationContext);
  if (!context) {
    throw new Error("useCreationContext must be used within a CreationProvider");
  }
  return context;
};

