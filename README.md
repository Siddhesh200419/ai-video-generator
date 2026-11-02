# ReelForge - AI YouTube Short Video Generator

An automated SaaS platform that converts ideas and topics into fully produced, captioned vertical YouTube Shorts and Reels using generative AI, cloud media synthesis, and distributed video rendering.

The system orchestrates the complete production lifecycle: high-retention script generation, multi-character voiceover synthesis, synchronized word-accurate captions, scene-by-scene visual generation, and programmatic cloud rendering into high-definition vertical MP4 videos.

---

## Architecture Overview

The application couples a Next.js 15 web interface and API layer with Inngest serverless background orchestration, multi-model AI pipelines, and AWS-distributed video rendering:

```
[ User Input: Topic / Theme / Voice / Captions / Style ]
                         │
                         ▼
        [ Multi-Step Creation Wizard & Live Preview ]
      (Script -> Voice -> Captions -> Theme -> Review)
                         │
                         ▼
               [ Next.js API Routes ]
      (Data Validation & Record Creation in DB)
                         │
                         ▼
         [ Neon PostgreSQL + Drizzle ORM ]
       (Store Record with 'pending' status)
                         │
                         ▼
           [ Inngest Background Workflow ]
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
[ Google Gemini TTS ]  [ Deepgram Nova-3 ] [ Groq AI (GPT-OSS-120B) ]
(Voice Synthesis ->    (Word-level         (Scene Prompts
 WAV to S3 Bucket)      Timestamps)         Generation)
       │                                           │
       └─────────────────┬─────────────────────────┘
                         ▼
        [ Cloudflare Workers AI FLUX Schnell ]
         (Scene Image Generation -> S3 Bucket)
                         │
                         ▼
         [ Neon PostgreSQL + Drizzle ORM ]
       (Assets Saved, Status -> 'generating')
                         │
                         ▼
              [ Remotion Lambda (AWS) ]
     (Parallel Frame Rendering, Ken Burns Transitions,
                 Audio & Caption Stitching)
                         │
                         ▼
            [ S3 Output Storage (MP4) ]
                         │
                         ▼
         [ Neon PostgreSQL + Drizzle ORM ]
      (Download URL Saved, Status -> 'completed')
                         │
                         ▼
     [ Dashboard / Video Library / Video Player ]
```

---

## Key Features

- **AI Scriptwriting Engine**:
  - Generates viral, high-retention 30-second scripts using Groq (`openai/gpt-oss-120b`).
  - Follows a narrative structure: Hook, Build, Turn, and Payoff.
  - Produces two distinct script variations per prompt with the option to customize or write custom scripts.

- **Natural AI Voiceovers**:
  - Converts scripts into lifelike speech using Google Gemini TTS (`gemini-3.8-flash-tts`).
  - Features diverse voice personas (Kore, Puck, Charon, Fenrir, Zephyr, Aoede, Helios, and more).
  - Normalizes raw audio to 16-bit PCM WAV headers via a custom audio converter.
  - Supports configurable narration playback speed.

- **Cloud Media Storage**:
  - Uploads all intermediate audio and visual assets to Amazon S3 using the AWS SDK for JavaScript (`@aws-sdk/client-s3`).
  - Implements automatic retry policies and fallback ACL configurations.

- **Synchronized Dynamic Captions**:
  - Uses Deepgram Nova-3 for speech-to-text alignment with word-level timestamps.
  - Highlights spoken words in real time with customizable fonts, font sizes, colors, and vertical alignment (top, center, bottom).

- **Multi-Scene AI Visual Generation**:
  - Uses Cloudflare Workers AI FLUX Schnell (`@cf/black-forest-labs/flux-1-schnell`) to generate visual scenes in 9:16 vertical resolution.
  - Automatically translates scripts into sequential visual storyboard prompts matched to selected styles (Cinematic, Realistic, Anime, Watercolor, Cyberpunk, 3D Render).

- **Multi-Step Studio & Real-Time Mobile Preview**:
  - Guided step-by-step creation flow:
    - Step 1: Script Generation (`/script-step`)
    - Step 2: Voiceover Selection (`/voice-step`)
    - Step 3: Caption Styling (`/captions-step`)
    - Step 4: Theme & Visual Style (`/theme-step`)
    - Step 5: Final Review & Render (`/review-step`)
  - Real-time mobile device preview component (`LivePreview.jsx`) reflecting style and caption settings instantly via React Context.
  - Alternative consolidated one-page creation interface (`/create-new-video`).

- **Real-Time Generation Progress**:
  - Dedicated progress screen (`/generation-progress`) with live stage tracking across audio synthesis, transcription, prompt engineering, image synthesis, and final video rendering.

- **Dual-Engine Video Playback & Cloud Export**:
  - In-browser interactive preview with Remotion Player (`/play-video/[videoId]`).
  - Serverless cloud rendering using Remotion Lambda on AWS, rendering high-definition MP4 files with Ken Burns scale animations and crossfade transitions.
  - Dedicated completion view (`/video-result`) with direct MP4 downloads and shareable links.

- **Video Library & Dashboard**:
  - Full management of created videos (`/my-videos`, `/dashboard`) with status badges (`completed`, `generating`, `pending`, `failed`), search, and playback.

- **Authentication & User Management**:
  - Firebase Authentication supporting Email/Password and Google OAuth sign-in.
  - Dedicated Login (`/log-in`) and Sign-Up (`/sign-up`) interfaces.
  - Automatic user sync to Neon PostgreSQL on login state changes.

- **Theming & UI**:
  - Dark and Light mode support via Next Themes.
  - Responsive layouts styled with Tailwind CSS and Radix UI primitives.

---

## Technology Stack

### Frontend & Application Layer
- **Framework**: Next.js 15 (App Router)
- **Language & Runtime**: JavaScript (ES6+), React 18, Node.js
- **Styling**: Tailwind CSS v4, Radix UI primitives, Lucide React icons
- **State Management**: React Context (`CreationContext`, `AuthContext`)
- **Notifications**: React Hot Toast
- **Theming**: Next Themes

### AI & Media Synthesis
- **Script & Storyboard AI**: Groq SDK (`openai/gpt-oss-120b`)
- **Voice Synthesis (TTS)**: Google Gemini API (`@google/generative-ai` using `gemini-3.8-flash-tts`)
- **Scene Image Generation**: Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`)
- **Speech-to-Text & Subtitles**: Deepgram Nova-3 API (`@deepgram/sdk`)
- **Programmatic Video**: Remotion, `@remotion/player`, `@remotion/lambda`

### Cloud, Storage & DevOps
- **Workflow Orchestration**: Inngest
- **Cloud Video Rendering**: AWS Lambda (via Remotion Lambda)
- **Asset & Video Storage**: Amazon S3 (`@aws-sdk/client-s3`)
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-In)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Drizzle ORM and Drizzle Kit

---

## Database Schema

Database migrations and schema definitions are managed through Drizzle ORM against Neon PostgreSQL.

### Table: `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique user identifier (`defaultRandom()`) |
| `name` | VARCHAR(255) | User display name |
| `email` | VARCHAR(255) | User email address (Unique index) |
| `picture_url` | TEXT | User avatar image URL |
| `credits` | INTEGER | Video generation credits balance (default: 3) |
| `created_at` | TIMESTAMP | Record creation timestamp (`now()`) |

### Table: `video_data`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique video identifier (`defaultRandom()`) |
| `title` | VARCHAR(255) | Video project title |
| `topic` | TEXT | Prompt topic or theme |
| `script` | TEXT | Full spoken script |
| `video_style` | VARCHAR(100) | Visual preset (Cinematic, Anime, Realistic, etc.) |
| `voice` | VARCHAR(100) | Selected voice identifier |
| `caption` | JSONB | Caption styling properties (font, color, style, position) |
| `images` | JSONB | Array of generated S3 image URLs |
| `audio_url` | TEXT | Hosted voiceover WAV URL in Amazon S3 |
| `caption_json` | JSONB | Word-level timestamp payload from Deepgram |
| `download_url` | TEXT | Rendered vertical MP4 video URL in Amazon S3 |
| `status` | VARCHAR(50) | Lifecycle state: `pending`, `generating`, `completed`, `failed` |
| `error_message` | TEXT | Diagnostic details if rendering encounters an error |
| `uid` | UUID (FK) | Reference to `users.id` (Cascade delete on user removal) |
| `created_by` | VARCHAR(255) | User email address |
| `created_at` | TIMESTAMP | Creation timestamp with timezone |

---

## Project Structure

```
├── _context/
│   ├── Authcontext.jsx             # Authentication context
│   └── CreationContext.jsx         # Multi-step creation state & localStorage cache
├── app/
│   ├── (main)/
│   │   ├── captions-step/          # Step 3: Caption styling and typography
│   │   ├── create-new-video/       # Consolidated tabbed video creator
│   │   ├── dashboard/              # User dashboard & video listing
│   │   ├── generation-progress/    # Real-time multi-stage pipeline status tracker
│   │   ├── my-videos/              # User video library grid
│   │   ├── play-video/[videoId]/   # Remotion video player, export & metadata
│   │   ├── review-step/            # Step 5: Final review and generation trigger
│   │   ├── script-step/            # Step 1: Topic selection & AI script generator
│   │   ├── theme-step/             # Step 4: Visual style & atmosphere selection
│   │   ├── video-result/           # Video completion & direct MP4 download
│   │   ├── voice-step/             # Step 2: Voice personality & speed picker
│   │   ├── _components/            # Shared main layout components (AppHeader, AppSidebar)
│   │   ├── layout.jsx              # Main app layout with sidebar and header
│   │   └── provider.jsx            # Main app provider wrapper
│   ├── api/
│   │   ├── generate-audio/         # Gemini TTS audio generation endpoint
│   │   ├── generate-script/        # Groq script generation endpoint
│   │   ├── generate-video-data/    # Video entry creation & Inngest job dispatch
│   │   ├── inngest/                # Inngest function pipeline and webhook route
│   │   ├── user/                   # User account sync endpoint
│   │   ├── video/[id]/             # Single video detail API
│   │   ├── videos/                 # User videos list API
│   │   └── voices/                 # Available voice list API
│   ├── log-in/                     # Dedicated email/password & Google login page
│   ├── sign-up/                    # Dedicated user registration page
│   ├── _components/                # Landing page components (Header, Hero, Composition)
│   ├── layout.js                   # Root layout with font and metadata configuration
│   ├── page.js                     # Public landing page
│   └── provider.js                 # Global providers (Auth, Creation, Theme, Toasts)
├── components/
│   ├── creation/
│   │   ├── LivePreview.jsx         # Real-time vertical mobile frame mockup
│   │   └── StepNav.jsx             # Progress step navigation bar
│   └── ui/                         # Reusable UI component library (Radix UI)
├── config/
│   ├── AiModel.jsx                 # Groq SDK configuration & script/prompt system prompts
│   └── firebaseConfig.jsx          # Firebase client SDK initialization
├── configs/
│   ├── db.js                       # Neon serverless database client
│   └── schema.js                   # Drizzle ORM table schemas
├── inngest/
│   └── client.js                   # Inngest client initialization
├── lib/
│   ├── pcmToWav.js                 # 16-bit PCM to RIFF/WAV audio header converter
│   ├── storage.js                  # Amazon S3 asset upload helper
│   └── utils.js                    # Style and className merging helpers
├── remotion/
│   ├── Composition.jsx             # Basic Remotion composition stub
│   ├── index.js                    # Remotion entry bundle for Lambda
│   └── Root.jsx                    # Remotion composition registry (720x1280 @ 30fps)
├── drizzle/                        # Drizzle SQL migration output
├── drizzle.config.js               # Drizzle Kit migration configuration
└── public/                         # Static assets and icons
```

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm package manager
- AWS account with S3 and Lambda permissions
- Groq API key (for script and scene prompt generation)
- Google Gemini API key (for voiceover audio synthesis)
- Cloudflare account with Workers AI enabled (for FLUX image generation)
- Deepgram API key (for audio transcription and word timestamps)
- Firebase project (for authentication)
- Neon PostgreSQL database instance

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/<your-username>/ai-youtube-short-video-generator.git
cd ai-youtube-short-video-generator
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Neon Serverless PostgreSQL Database
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# Groq AI (Script and Scene Storyboard Generation)
GROQ_API_KEY=your_groq_api_key

# Google Gemini (TTS Voiceover Generation)
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Cloudflare Workers AI (FLUX Image Generation)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Deepgram (Word-level Caption Timestamps)
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

# AWS Credentials (S3 Asset Storage & Remotion Lambda)
REMOTION_AWS_ACCESS_KEY_ID=your_aws_access_key_id
REMOTION_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_SERVE_URL=https://<your-s3-bucket>.s3.us-east-1.amazonaws.com/sites/ai-youtube-video-gen/index.html

# Optional S3 Asset Storage Overrides
ASSET_BUCKET=your_s3_bucket_name
ASSET_REGION=us-east-1
```

### 4. Database Setup & Migrations
Push schema definitions to your Neon PostgreSQL instance:

```bash
npx drizzle-kit push
```

To explore or modify database records in the Drizzle web interface:

```bash
npx drizzle-kit studio
```

### 5. Deploy Remotion Composition to AWS Lambda
Bundle and upload the Remotion video composition to your Amazon S3 bucket:

```bash
npx remotion lambda sites create remotion/index.js --site-name=ai-youtube-video-gen
```

Copy the generated `Serve URL` and set it as `AWS_SERVE_URL` in your `.env.local` file.

### 6. Run Local Development Servers
Start the Next.js development server:

```bash
npm run dev
```

In a separate terminal window, start the Inngest local development agent to process background workflows:

```bash
npx inngest-cli@latest dev
```

Application endpoints:
- Web Application: `http://localhost:3000`
- Inngest Dev Dashboard: `http://localhost:8288`

---

## Production Build

To verify that the application compiles without errors:

```bash
npm run build
```

To run the production server locally:

```bash
npm run start
```

---

## License

This project is licensed under the MIT License.
