# AI YouTube Short Video Generator

** An intelligent SaaS application that transforms ideas into engaging YouTube Shorts using the power of AI.**

This project leverages cutting-edge AI models to automate the entire video creation process—from scriptwriting and voiceovers to image generation and video editing.

---

## Key Features

-   **AI Script Generation**: Automatically writes creative and engaging scripts for your videos using **Google Gemini**.
-   **AI Image Generation**: Creates stunning, cinematic visuals for every scene using advanced image models (e.g., SDXL/Flux via APIs).
-   **Realistic Voiceovers**: Converts text to natural-sounding speech.
-   **Auto-Captions**: Generates and overlays accurate subtitles using **Deepgram**.
-   **Automated Editing**: Stitches audio, images, and captions together into a polished video using **Remotion**.
-   **Secure Authentication**: Integrated user login and signup via **Firebase Auth**.
-   **Real-time Database**: Powered by **Convex** for fast and reliable data storage.
-   **Background Processing**: Handles complex video rendering tasks efficiently with **Inngest**.

---

## Technology Stack

-   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Shadcn UI
-   **Backend**: Convex (Serverless Database & Functions)
-   **Authentication**: Firebase Auth
-   **AI & ML**:
    -   Google Gemini (Script & Prompts)
    -   Deepgram (Transcription/Captions)
    -   AI Guru Lab (Image/Audio APIs)
-   **Video Engine**: Remotion
-   **Infrastructure**: Inngest (Event-driven queues)

---

## How It Works

1.  **Topic Input**: You provide a topic (e.g., "The History of Mars", "Scary Campfire Story").
2.  **Script Creation**: The AI generates a structured script with scenes and dialogue.
3.  **Media Generation**:
    -   Voiceover audio is generated from the script.
    -   Visual prompts are created and sent to the image generation API.
    -   Captions are extracted from the audio.
4.  **Assembly**: The **Remotion** engine combines the audio, images, and captions into a single MP4 video file.
5.  **Result**: You can preview and download the final video.

---

## Setup & Installation

**Want to run this project locally?**

**[Click here for the detailed SETUP.md guide](./SETUP.md)**

The setup guide covers:
-   Prerequisites (Node.js, API Keys)
-   Installation Steps
-   Environment Variable Configuration
-   Running the Dev Server

---

## Project Structure

```
├── app/                  # Next.js App Router (Frontend Pages & API)
│   ├── (main)/           # Dashboard & Core App Routes
│   ├── api/              # API Routes (Inngest, Generators)
├── convex/               # Backend Schema & Functions
├── remotion/             # Video Composition & Rendering Logic
├── components/           # UI Components (Shadcn UI)
├── config/               # Configuration (Firebase, AI Models)
├── inngest/              # Background Job Definitions
└── public/               # Static Assets
```

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
