# ReelForge — Setup & Installation Guide

This guide covers running ReelForge locally and deploying it to production.

ReelForge is a **Next.js 15 app** that orchestrates several managed services. Only
the Next.js app runs on your machine — the database, background jobs, video
renderer, and asset storage are cloud services you configure once.

---

## 📋 Prerequisites

1. **Node.js 18+** (Node 20+ recommended) — [download](https://nodejs.org/)
2. **npm** (bundled with Node)
3. **Git** — [download](https://git-scm.com/)

You will also need accounts and credentials for:

| Service | Used for | Where to get it |
|---|---|---|
| **Neon** (PostgreSQL) | Users + video records | [neon.tech](https://neon.tech) |
| **Groq** | Script + storyboard generation | [console.groq.com](https://console.groq.com) |
| **Google Gemini** | Text-to-speech voiceover | [ai.google.dev](https://ai.google.dev) |
| **Cloudflare Workers AI** | FLUX scene image generation | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **Deepgram** | Word-level caption timestamps | [console.deepgram.com](https://console.deepgram.com) |
| **Firebase** | Authentication (email + Google) | [console.firebase.google.com](https://console.firebase.google.com) |
| **AWS** | Remotion Lambda rendering + S3 assets | [aws.amazon.com](https://aws.amazon.com) |
| **Inngest** | Background pipeline orchestration | [inngest.com](https://www.inngest.com) |

> **AWS is the heaviest prerequisite.** You need an S3 bucket, an IAM role for
> Remotion Lambda, and permission to deploy Lambda functions in `us-east-1`.

---

## 🚀 Local Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd ai-video-generator
npm install
```

### 2. Create `.env.local`

Create the file in the project root:

```bash
touch .env.local
```

Fill it in using the reference below. Every variable is read by the code — the
"Required for" column tells you which feature breaks without it.

#### Database

| Variable | Required for |
|---|---|
| `DATABASE_URL` | All data access (Neon connection string, keep `?sslmode=require`) |

#### AI — script, storyboard, voice, images, captions

| Variable | Required for |
|---|---|
| `GROQ_API_KEY` | Script + scene-prompt generation |
| `GEMINI_API_KEY` | Voiceover synthesis (server-side TTS) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Fallback for the TTS key; **legacy — prefer `GEMINI_API_KEY`** |
| `CLOUDFLARE_ACCOUNT_ID` | FLUX scene image generation |
| `CLOUDFLARE_API_TOKEN` | FLUX scene image generation |
| `DEEPGRAM_API_KEY` | Caption alignment |
| `NEXT_PUBLIC_DEEPGRAM_API_KEY` | Fallback for the caption key; **legacy — prefer `DEEPGRAM_API_KEY`** |

Optional model / throughput tuning:

| Variable | Default | Purpose |
|---|---|---|
| `GROQ_SCRIPT_MODEL` | `openai/gpt-oss-120b` | Creative script model |
| `GROQ_PROMPT_MODEL` | `openai/gpt-oss-20b` | Cheaper model for structured scene prompts |
| `IMAGE_CONCURRENCY` | `3` | Max FLUX requests in flight |
| `RENDER_CONCURRENCY` | `8` | Remotion Lambda parallel render threads (bounded by your AWS Lambda concurrency quota) |

> **Security note:** variables prefixed with `NEXT_PUBLIC_` are embedded in the
> browser bundle. Only `NEXT_PUBLIC_FIREBASE_API_KEY` genuinely needs that prefix
> (the Firebase client SDK runs in the browser). The Gemini and Deepgram keys are
> used only server-side, so the non-prefixed names are preferred.

#### Authentication

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Auth client SDK |

Other Firebase values (project id, auth domain, app id) are already hard-coded in
[config/firebaseConfig.jsx](../config/firebaseConfig.jsx).

#### Storage & rendering

| Variable | Required for |
|---|---|
| `REMOTION_AWS_ACCESS_KEY_ID` | S3 uploads + Remotion Lambda |
| `REMOTION_AWS_SECRET_ACCESS_KEY` | S3 uploads + Remotion Lambda |
| `AWS_SERVE_URL` | URL of the deployed Remotion bundle (see step 4) |
| `ASSET_BUCKET` | S3 bucket for audio/images (falls back to the `AWS_SERVE_URL` hostname) |
| `ASSET_REGION` | S3 region (defaults to `us-east-1`) |

#### Background jobs

| Variable | Required for |
|---|---|
| `INNGEST_EVENT_KEY` | Production event sending |
| `INNGEST_SIGNING_KEY` | Production webhook verification |

Both are only needed in production. Locally, the Inngest dev server handles this.

### 3. Push the database schema

```bash
npx drizzle-kit push
```

This creates the `users` and `video_data` tables (including the
`(uid, created_at)` index used by the dashboard). To browse the data afterwards:

```bash
npx drizzle-kit studio
```

### 4. Deploy the Remotion composition to AWS Lambda

The app renders finished MP4s with **Remotion Lambda**, which is deployed
separately from the Next.js app. Run these once per AWS account:

```bash
npx remotion lambda policies role        # create the IAM role Remotion needs
npx remotion lambda functions deploy     # deploy the render Lambda function
npx remotion lambda sites create remotion/index.js --site-name=ai-youtube-video-gen
```

The last command prints a **Serve URL**. Set it as `AWS_SERVE_URL`:

```env
AWS_SERVE_URL=https://<your-bucket>.s3.us-east-1.amazonaws.com/sites/ai-youtube-video-gen/index.html
```

Make sure the bucket allows public reads (the app uploads assets with
`public-read` and falls back gracefully if ACLs are disabled on the bucket).

### 5. Start the dev servers

Terminal 1 — Next.js:

```bash
npm run dev
```

Terminal 2 — Inngest dev agent (required for any video generation to run):

```bash
npx inngest-cli@latest dev
```

- App: <http://localhost:3000>
- Inngest dashboard: <http://localhost:8288>

### 6. Verify

Sign in, create a video, then watch the run in the Inngest dashboard. A healthy
run walks through: `audio` → `scenes` → `captions` → `render` → `done`, and the
record's `status` flips `pending` → `generating` → `completed`.

---

## ☁️ Production Deployment

The app is built for **Vercel** + managed services.

1. **Push to GitHub** and import the repository in Vercel (Next.js is auto-detected).
2. **Add every environment variable above**, plus `INNGEST_EVENT_KEY` and
   `INNGEST_SIGNING_KEY` from your Inngest app.
3. **Deploy.**
4. **Register the Inngest app URL** in the Inngest dashboard:
   `https://<your-domain>/api/inngest`.
5. **Use a plan with generous function limits.** The render step polls Remotion
   until the MP4 is finished, which can outlast short serverless timeouts
   (Vercel Pro + Fluid Compute is a safe default).

### Build commands

```bash
npm run build
npm start
```

---

## 🐞 Troubleshooting

- **"Missing Cloudflare credentials"** — `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` are unset.
  The pipeline refuses to start rather than silently produce broken scenes.
- **Stuck at `pending`** — the Inngest dev agent isn't running, or (in production)
  the app URL isn't registered in Inngest.
- **"AWS Concurrency limit reached"** — lower `RENDER_CONCURRENCY`, or raise the
  Lambda concurrent-executions quota in AWS Service Quotas before increasing it.
- **Auth works but no user row appears** — check `DATABASE_URL`; user sync happens
  in [app/provider.js](../app/provider.js) on every auth state change.
- **Captions never appear** — confirm the Deepgram key is valid and the audio URL
  is publicly reachable (Deepgram transcribes by URL, not by upload).
