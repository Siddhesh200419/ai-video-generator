# AI YouTube Short Video Generator

An automated SaaS application that converts ideas and topics into fully produced, captioned YouTube Shorts using generative AI and cloud video rendering.

The platform orchestrates the complete video production lifecycle: script generation, multi-scene visual synthesis, natural voiceovers, word-accurate subtitles, and programmatic rendering into high-definition vertical MP4 videos.

---

## Architecture Overview

The system combines a Next.js 15 frontend and API layer with serverless background processing and cloud-distributed video rendering:

```
[ User Input: Topic / Style / Voice / Caption Style ]
                         │
                         ▼
             [ Next.js API Routes ]
         (Validation & Credit Management)
                         │
                         ▼
        [ Neon PostgreSQL + Drizzle ORM ]
         (Store Record with 'pending' status)
                         │
                         ▼
         [ Inngest Background Workflow ]
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
[ Google Gemini ]  [ AI Guru Lab ]      [ Deepgram ]
(Script & Prompts) (TTS Voiceover &     (Word-level
                    Scene Images)        Timestamps)
                         │
                         ▼
         [ Neon PostgreSQL + Drizzle ORM ]
          (Assets Saved, Status -> 'generating')
                         │
                         ▼
              [ Remotion Lambda (AWS) ]
     (Parallel Frame Rendering & Audio Stitching)
                         │
                         ▼
            [ S3 Output Storage (MP4) ]
                         │
                         ▼
         [ Neon PostgreSQL + Drizzle ORM ]
          (Download URL Saved, Status -> 'completed')
                         │
                         ▼
           [ Dashboard / Video Player ]
```

---

## Key Features

- **Automated Script Generation**: Generates structured, high-retention video scripts tailored to chosen themes and topics using Google Gemini.
- **Scene Prompt Engineering & Image Generation**: Translates script scenes into distinct visual prompts and generates matched images via AI image models.
- **Natural Voiceovers**: Converts script text into high-quality spoken audio with selectable voice personalities.
- **Synchronized Captions**: Transcribes generated audio via Deepgram to obtain precise word-level timestamps, rendering animated dynamic subtitles.
- **Dual-Engine Video Playback & Cloud Rendering**:
  - In-browser interactive preview using Remotion Player with adjustable playback controls.
  - Serverless cloud rendering using Remotion Lambda on AWS, outputting production-ready MP4 files.
- **Credit & User Management**: Credit-based usage system with automatic balance tracking per user.
- **Authentication**: Secure Google-based login powered by Firebase Authentication.
- **Robust Background Processing**: Fault-tolerant multi-step workflow pipeline managed by Inngest with retry handling and status tracking.

---

## Technology Stack

### Frontend & Application Layer
- **Framework**: Next.js 15 (App Router)
- **Language & Runtime**: JavaScript (ES6+), React 18, Node.js
- **Styling**: Tailwind CSS, Shadcn UI components, Lucide React icons
- **Theming**: Next Themes (Dark & Light support)

### Database & Data Layer
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM with Drizzle Kit migrations
- **Driver**: `@neondatabase/serverless` HTTP driver

### AI & Media Services
- **Text & Prompt AI**: Google Gemini API (`@google/generative-ai`)
- **Speech-to-Text**: Deepgram API (`@deepgram/sdk`)
- **Audio & Image Synthesis**: AI Guru Lab API
- **Video Composition & Rendering**: Remotion, `@remotion/player`, `@remotion/lambda`

### Cloud & DevOps
- **Workflow Orchestration**: Inngest
- **Cloud Rendering Infrastructure**: AWS Lambda and Amazon S3 (via Remotion Lambda)
- **Authentication**: Firebase Auth

---

## Database Schema

Managed with Drizzle ORM against PostgreSQL:

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique user identifier (`defaultRandom()`) |
| `name` | VARCHAR(255) | User display name |
| `email` | VARCHAR(255) | User email address (Unique index) |
| `picture_url` | TEXT | User avatar image URL |
| `credits` | INTEGER | Available video generation credits (default: 3) |
| `created_at` | TIMESTAMP | Record creation timestamp |

### `video_data`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique video identifier (`defaultRandom()`) |
| `title` | VARCHAR(255) | Video title |
| `topic` | TEXT | Video topic prompt |
| `script` | TEXT | Generated script text |
| `video_style` | VARCHAR(100) | Visual style preset |
| `voice` | VARCHAR(100) | Voice identifier |
| `caption` | JSONB | Caption styling options |
| `images` | JSONB | Array of generated scene image URLs |
| `audio_url` | TEXT | Hosted voiceover audio URL |
| `caption_json` | JSONB | Word-level timestamp data from Deepgram |
| `download_url` | TEXT | Final rendered MP4 URL in S3 |
| `status` | VARCHAR(50) | State: `pending`, `generating`, `completed`, `failed` |
| `error_message`| TEXT | Diagnostic message if render fails |
| `uid` | UUID (FK) | Reference to `users.id` (Cascade delete) |
| `created_by` | VARCHAR(255) | Creator email address |
| `created_at` | TIMESTAMP | Record creation timestamp |

---

## Project Structure

```
├── app/
│   ├── (main)/
│   │   ├── create-new-video/       # Video creation wizard & form steps
│   │   ├── dashboard/              # User dashboard & video listing grid
│   │   ├── explore/                # Community showcase page
│   │   ├── billing/                # Subscription & credit purchase page
│   │   └── play-video/[videoId]/   # Remotion player preview & export
│   ├── api/
│   │   ├── generate-script/        # Gemini script generator endpoint
│   │   ├── generate-video-data/    # Video record creation & credit deduction
│   │   ├── inngest/                # Inngest webhook route & event handler
│   │   ├── user/                   # User profile sync & credit endpoint
│   │   ├── video/[id]/             # Single video retrieval endpoint
│   │   └── videos/                 # User video collection endpoint
│   ├── layout.js                   # Root layout with fonts & theme provider
│   └── provider.js                 # Global auth and theme context
├── configs/
│   ├── db.js                       # Neon serverless HTTP client connection
│   └── schema.js                   # Drizzle ORM table definitions
├── config/
│   ├── AiModel.jsx                 # Google Gemini initialization & prompts
│   └── firebaseConfig.jsx          # Firebase client SDK initialization
├── inngest/
│   └── client.js                   # Inngest client initialization
├── remotion/
│   ├── Root.jsx                    # Remotion composition registry & metadata
│   ├── Composition.jsx             # Fallback composition component
│   └── index.js                    # Remotion bundle entry point
├── drizzle/                        # Drizzle SQL migration files
├── drizzle.config.js               # Drizzle Kit configuration
└── public/                         # Static assets and icons
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js version 18.0.0 or higher
- npm or pnpm package manager
- AWS account with Lambda & S3 permissions (for Remotion Lambda rendering)
- API keys for Gemini, Firebase, Deepgram, and AI Guru Lab

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/<your-username>/ai-youtube-short-video-generator.git
cd ai-youtube-short-video-generator
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Neon PostgreSQL Database
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key

# Deepgram Transcription
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key

# AI Guru Lab (Voiceover & Image Generation)
NEXT_PUBLIC_AIGURULAB_API_KEY=your_aigurulab_api_key

# AWS & Remotion Lambda
REMOTION_AWS_ACCESS_KEY_ID=your_aws_access_key_id
REMOTION_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_SERVE_URL=https://<your-s3-bucket>.s3.us-east-1.amazonaws.com/sites/ai-youtube-video-gen/index.html
```

### 4. Database Migrations
Push schema changes to your Neon PostgreSQL instance:
```bash
npx drizzle-kit push
```

To inspect database tables in a local web interface:
```bash
npx drizzle-kit studio
```

### 5. Deploy Remotion Site to AWS Lambda
Bundle and upload the Remotion video composition to your S3 bucket:
```bash
npx remotion lambda sites create remotion/index.js --site-name=ai-youtube-video-gen
```
Copy the resulting `Serve URL` and assign it to `AWS_SERVE_URL` in your `.env.local`.

### 6. Start Development Servers
Start the Next.js development server:
```bash
npm run dev
```

In a separate terminal, start the Inngest local development server to process workflow jobs:
```bash
npx inngest-cli@latest dev
```

The application will be accessible at:
- Web App: `http://localhost:3000`
- Inngest Dashboard: `http://localhost:8288`

---

## Production Build

To verify that the application compiles cleanly for production:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

## License

This project is licensed under the MIT License.
