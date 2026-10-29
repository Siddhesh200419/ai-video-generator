"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export const CreationContext = createContext();

const STORAGE_KEY = "reelforge_creation_data";

const initialData = {
  title: "",
  topic: "",
  theme: "Facts",
  customTopic: "",
  script: "",
  scripts: [],
  selectedScriptIndex: null,
  voice: "Nova",
  voiceSpeed: 1.0,
  caption: {
    name: "Bold word-by-word highlight",
    style: "text-yellow-400 text-3xl font-extrabold uppercase tracking-wide",
    font: "Bricolage Grotesque",
    size: 56,
    position: "bottom",
    color: "#f59e0b",
  },
  videoStyle: "Cinematic",
  mood: "Lo-fi",
  filmGrain: false,
};

export function CreationProvider({ children }) {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...initialData, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Error reading saved creation data", e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
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
      localStorage.removeItem(STORAGE_KEY);
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

