# ⚙️ Setup & Installation Guide

This guide will help you set up the **AI YouTube Short Video Generator** on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js**: Version 18 or higher is required. [Download Node.js](https://nodejs.org/)
2.  **npm** (Node Package Manager): Comes with Node.js.
3.  **Git**: For cloning the repository. [Download Git](https://git-scm.com/)

You will also need accounts/API keys for the following services:
-   **Google Gemini**: For AI text and script generation. [Get API Key](https://ai.google.dev/)
-   **Firebase**: For User Authentication. [Firebase Console](https://console.firebase.google.com/)
-   **Convex**: For the backend database. [Convex Dashboard](https://dashboard.convex.dev/)
-   **Deepgram**: For audio transcription/captions. [Deepgram Console](https://console.deepgram.com/)
-   **AI Guru Lab (or equivalent)**: For image/audio generation (as seen in the codebase).

---

## 🚀 Installation Steps

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone <repository-url>
cd ai-youtube-short-video-generator
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory of the project.

```bash
# Windows (PowerShell)
new-item .env.local
# Mac/Linux
touch .env.local
```

Open `.env.local` and add the following variables:

```env
# Google Gemini AI (Script & Image Prompts)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase (Authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here

# Convex (Database & Backend)
# These are usually set automatically by `npx convex dev`, but you can set them explicitly.
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# AI Guru Lab (Image/Audio Generation)
NEXT_PUBLIC_AIGURULAB_API_KEY=your_aigurulab_api_key_here

# Deepgram (Captions & Transcription)
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 4. Setup Convex

Initialize and run the Convex backend dev server:

```bash
npx convex dev
```

This command will:
-   Prompt you to log in to Convex.
-   Create a new project or link to an existing one.
-   Generate the necessary environment variables (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`) in `.env.local`.
-   Push your schema and functions to the cloud.

**Note:** Keep this terminal running! It syncs your backend changes in real-time.

---

## ▶️ Running the Application

### 1. Start the Development Server

Open a **new terminal window** (keep `npx convex dev` running in the first one) and run:

```bash
npm run dev
```

### 2. Access the App

Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

### 3. (Optional) Run Inngest Dev Server

If you are modifying background jobs or want to test the Inngest functions locally:

```bash
npx inngest-cli@latest dev
```
This will open the Inngest dashboard (usually at `http://localhost:8288`) where you can trigger events and debug functions.

---

## 🐞 Common Issues & Troubleshooting

-   **Missing API Keys:** If features like script generation or image creation fail, double-check your `.env.local` file to ensure all API keys are correct and active.
-   **Convex Not Running:** Ensure `npx convex dev` is running in a separate terminal. The app needs the backend to be active.
-   **Dependency Errors:** If you encounter issues during `npm install`, try deleting `node_modules` and `package-lock.json` and running `npm install` again.

## 📦 Build for Production

To create a production build:

```bash
npm run build
npm start
```
