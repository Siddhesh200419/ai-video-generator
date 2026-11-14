# ReelForge — AI YouTube Short Video Generator

An automated SaaS platform that turns a topic or idea into a fully produced,
captioned vertical YouTube Short — script, voiceover, synchronized captions,
AI-generated scenes, and a rendered HD MP4.

The system orchestrates the entire production lifecycle: high-retention script
generation, multi-character voiceover synthesis, word-accurate captions,
scene-by-scene visual generation, and programmatic cloud rendering.

---

## Architecture Overview

The app couples a Next.js 15 web interface and API layer with Inngest
serverless background orchestration, multi-model AI pipelines, and AWS-distributed
video rendering.

```
[ User Input: Topic / Title / Theme / Voice / Captions / Style ]
                         │
                         ▼
        [ Multi-Step Creation Wizard & Live Preview ]
      (Script -> Voice -> Captions -> Theme -> Review)
                         │
                         ▼
               [ Next.js API Routes ]
        (Validate input, insert record with 'pending')
                         │
                         ▼
           [ Neon PostgreSQL + Drizzle ORM ]
                         │
                         ▼
          [ Inngest Background Pipeline ]
                         │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
[ Google Gemini TTS ]              [ Groq (GPT-OSS) ]
(synthesize voice -> WAV -> S3)    (scene image prompts)
       │                                   │
       │                                   ▼
       │                     [ Cloudflare Workers AI FLUX Schnell ]
       │                     (scene images -> S3)
       │                                   │
       └───────────────┬───────────────────┘
                       ▼
              [ Deepgram Nova-3 ]
        (word-level caption timestamps)
                       │
                       ▼
         [ Neon PostgreSQL + Drizzle ORM ]
          (assets saved, status -> 'generating')
                       │
                       ▼
            [ Remotion Lambda (AWS) ]
     (parallel frame rendering, Ken Burns
        transitions, audio + caption stitch)
                       │
                       ▼
            [ S3 Output Storage (MP4) ]
                       │
                       ▼
     [ Dashboard / Video Library / Video Player ]
```

---

## Key Features

- **AI scriptwriting engine** — generates two distinct, high-retention 30-second
  scripts per prompt (Hook → Build → Turn → Payoff) via Groq.
- **Natural AI voiceovers** — Google Gemini TTS with 10 selectable voice
  personas, normalized to 16-bit PCM WAV by a custom converter.
- **Synchronized dynamic captions** — Deepgram Nova-3 word-level timestamps with
  configurable font, size, color, and vertical alignment.
- **Multi-scene AI visuals** — Cloudflare Workers AI FLUX Schnell generates
  9:16 vertical scenes, matched to a chosen visual style.
- **Guided creation wizard** — Script → Voice → Captions → Theme → Review, with a
  real-time mobile preview reflecting style and caption settings instantly.
- **Live generation progress** — a progress screen that mirrors the *real*
  pipeline (`currentStep` + `progress` written by Inngest), not a simulated bar.
- **Dual-engine playback** — in-browser Remotion Player preview plus serverless
  Remotion Lambda export to a downloadable HD MP4.
- **Video library & dashboard** — paginated grid with status badges, tab filters,
  search-free quick scanning, and inline delete.
- **Authentication** — Firebase Auth (email/password + Google) with automatic
  user sync to PostgreSQL.
- **Theming** — dark/light mode via Next Themes, styled with Tailwind CSS v4 and
  Radix UI primitives.

---

## Technology Stack

| Layer | Choices |
|---|---|
| **Framework** | Next.js 15 (App Router), React 18, JavaScript |
| **Styling / UI** | Tailwind CSS v4, Radix UI, Lucide React, CVA |
| **Script & storyboard AI** | Groq SDK — `openai/gpt-oss-120b` (script), `openai/gpt-oss-20b` (prompts) |
| **Voice synthesis** | Google Gemini — `gemini-3.8-flash-tts` |
| **Scene images** | Cloudflare Workers AI — `@cf/black-forest-labs/flux-1-schnell` |
| **Captions** | Deepgram Nova-3 |
| **Video** | Remotion, `@remotion/player`, `@remotion/lambda` |
| **Orchestration** | Inngest |
| **Database / ORM** | Neon Serverless PostgreSQL, Drizzle ORM + Drizzle Kit |
| **Auth** | Firebase Authentication |
| **Storage** | Amazon S3 (`@aws-sdk/client-s3`) |

---

## Database Schema

Defined in [configs/schema.js](configs/schema.js) and managed with Drizzle Kit.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `defaultRandom()` |
| `name` | VARCHAR(255) | Not null |
| `email` | VARCHAR(255) | Not null, unique |
| `picture_url` | TEXT | Not null |
| `credits` | INTEGER | Not null, default `3` |
| `created_at` | TIMESTAMPTZ | Not null, default `now()` |

### `video_data`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `defaultRandom()` |
| `title` | VARCHAR(255) | Not null, sanitized on insert |
| `topic` | TEXT | Not null |
| `script` | TEXT | Not null |
| `video_style` | VARCHAR(100) | Not null |
| `voice` | VARCHAR(100) | Not null |
| `caption` | JSONB | Caption styling (font, color, position) |
| `images` | JSONB | Array of S3 scene-image URLs |
| `audio_url` | TEXT | Voiceover WAV URL in S3 |
| `caption_json` | JSONB | Deepgram word-level timestamps |
| `download_url` | TEXT | Rendered MP4 URL in S3 |
| `status` | VARCHAR(50) | `pending` \| `generating` \| `completed` \| `failed` |
| `error_message` | TEXT | Populated when `status = 'failed'` |
| `current_step` | VARCHAR(50) | `queued` \| `audio` \| `scenes` \| `captions` \| `render` \| `done` |
| `progress` | INTEGER | 0–100, driven by the pipeline |
| `uid` | UUID FK | → `users.id`, cascade delete |
| `created_by` | VARCHAR(255) | User email |
| `created_at` | TIMESTAMPTZ | Default `now()` |

Indexes: `(uid, created_at)` — serves the dashboard query (filter by user, newest
first) and still covers user-only lookups via its leftmost prefix.

---

## Generation Pipeline

The pipeline lives in
[app/api/inngest/function.js](app/api/inngest/function.js) and is triggered by the
`generate-video-data` event.

| Step | What happens | Progress |
|---|---|---|
| 1 | **Audio** — Gemini TTS synthesizes the script, converted to WAV and uploaded to S3 | 10% |
| 2 | **Prompts** — Groq splits the script into 4–5 scene image prompts *(runs in parallel with step 1)* | — |
| 3 | **Scenes** — FLUX generates each image and uploads it to S3 as soon as prompts are ready, without waiting for audio | 35% |
| 4 | **Captions** — Deepgram transcribes the audio as soon as its upload finishes, without waiting for scenes | 60% |
| 5 | **Persist** — audio, images, and captions saved; status → `generating` | — |
| 6 | **Render** — Remotion Lambda renders the vertical MP4 | 65% |
| 7 | **Finalize** — Remotion progress is polled and mirrored to the DB; `download_url` saved, status → `completed` | 65→100% |

Asset preparation runs in two overlapping branches: `audio → captions` and
`prompts → images`. Rendering starts only after both branches finish. Image
request limits, Lambda concurrency, providers, and render quality are unchanged.

The UI polls `GET /api/video/[id]`. Progress milestones stay ordered even when
asset branches finish out of order: 35% means audio and prompts are ready; 60%
means images are also ready; 65% means all assets are ready for rendering.

Run `npm run test:pipeline` to verify branch scheduling, failure handling, and
Inngest replay with mocked services (no cloud calls or video rendering).

---

## Project Structure

```
├── _context/                     # Auth + creation-wizard React contexts
├── app/
│   ├── (main)/
│   │   ├── script-step/          # 1. Topic + AI script generation
│   │   ├── voice-step/           # 2. Voice persona + playback speed
│   │   ├── captions-step/        # 3. Caption styling
│   │   ├── theme-step/           # 4. Visual style
│   │   ├── review-step/          # 5. Final review + trigger render
│   │   ├── create-new-video/     # Consolidated tabbed creator
│   │   ├── dashboard/            # Video grid (paginated, tab filters)
│   │   ├── my-videos/            # Video library
│   │   ├── generation-progress/  # Live pipeline status
│   │   ├── play-video/[videoId]/ # Remotion player + metadata
│   │   ├── video-result/         # Completion + MP4 download
│   │   └── _components/          # AppHeader, AppSidebar
│   ├── api/
│   │   ├── generate-audio/       # Gemini TTS
│   │   ├── generate-script/      # Groq script generation
│   │   ├── generate-video-data/  # Create record + dispatch Inngest job
│   │   ├── inngest/              # Pipeline definition + webhook route
│   │   ├── user/                 # User upsert on auth
│   │   ├── video/[id]/           # Single video GET + DELETE
│   │   ├── videos/               # Paginated video list
│   │   └── voices/               # Static voice catalogue (cached)
│   ├── log-in/ · sign-up/        # Auth pages
│   └── layout.js · page.js       # Root layout + landing page
├── components/ui/                # Radix-based component library
├── config/
│   ├── AiModel.jsx               # Groq config + system prompts + model tiering
│   └── firebaseConfig.jsx        # Firebase client init
├── configs/
│   ├── db.js                     # Neon serverless client
│   └── schema.js                 # Drizzle table definitions
├── inngest/client.js             # Inngest client
├── lib/
│   ├── pcmToWav.js               # PCM → RIFF/WAV header converter
│   ├── storage.js                # S3 upload/delete helper
│   ├── videoProgress.js          # Shared pipeline step model
│   └── utils.js                  # className merge helper
└── remotion/                     # Root, Composition, entry point
```

---

## Performance & Reliability Notes

The pipeline and dashboard are tuned to stay predictable as usage grows:

- **Bounded image concurrency** — scene images are generated with at most
  `IMAGE_CONCURRENCY` (default 3) requests in flight, instead of fanning out to
  every scene at once.
- **Targeted retries** — FLUX, Gemini TTS, and Deepgram calls are retried with
  backoff *inside* their step, so one transient failure does not fail the whole
  step and force every sibling call to re-run (and re-spend).
- **Model tiering** — the creative script keeps the larger model while structured
  scene-prompt extraction uses a cheaper, faster model.
- **Paginated, column-scoped list API** — `GET /api/videos` returns one page at a
  time and omits heavy columns (`caption_json`, `script`), extracting only the
  first scene image for the thumbnail.
- **Server-side tab filtering** — status tabs filter in SQL so pagination stays
  correct on every tab.
- **Visibility-aware polling** — client polling pauses while the tab is hidden
  and refreshes immediately on return.
- **Cached static endpoints** — the voice catalogue is served with a long
  `Cache-Control` window.
- **Lean client bundle** — native `Intl` date formatting replaces moment.js, and
  the UI uses a single `cn` helper from `lib/utils`.

---

## Getting Started

See **[SETUP.md](SETUP.md)** for the full local setup and deployment guide.

Quick start:

```bash
npm install
npx drizzle-kit push                 # create tables in Neon
# ... deploy the Remotion composition + fill in .env.local (see SETUP.md)
npm run dev                          # http://localhost:3000
npx inngest-cli@latest dev           # http://localhost:8288 (second terminal)
```

---

## Deployment

The app targets **Vercel** for the Next.js layer, plus Neon, Inngest Cloud, and
AWS (Remotion Lambda + S3). Full instructions are in
**[SETUP.md](SETUP.md#-production-deployment)**.
