# ReelForge

ReelForge turns an idea into a short vertical video. You choose a topic, pick a script and voice, and set the visual style. The app then creates the narration, scene images, and captions, and puts them together into an MP4 you can download.

It uses Next.js for the website, Inngest for background jobs, and Remotion on AWS Lambda to render the finished video. The current output is a 9:16 video at 720 × 1280 pixels and 30 frames per second. Its length follows the narration's caption timestamps.

## Creating a video

1. **Start with a topic.** Add a title, choose a genre and language, and generate two script options. Each generated script contains 65–85 words. Choose the one you want to use before continuing.
2. **Choose a voice.** Listen to the ten included voice samples and select a narrator. Samples are stored locally, so playing them does not make a new text-to-speech request.
3. **Set up captions.** Choose a font, color, and position. A live preview helps you see how your choices look in a vertical frame.
4. **Pick a visual style.** Choose the look you want for the generated scenes, such as cinematic, anime, or watercolor.
5. **Review and generate.** Check your choices and start the job. The progress page shows updates from the background pipeline. Once rendering finishes, you can watch and download the video.

Your draft is saved in the browser as you work. The dashboard and video library let you browse videos, filter by status, and delete entries. The app also includes email/password and Google sign-in through Firebase, along with light and dark themes.

### Languages

The creation flow offers English, Hindi, and Marathi. Hindi scripts use conversational Hinglish written in Roman letters; Marathi scripts use the same approach for Marathi, called Marathlish in the app. The selected language is passed to both voice generation and caption transcription. Hindi and Marathi transcription requests target their respective languages, so captions may use Devanagari even though the generated scripts use Roman letters.

### Current limits

Playback speed, mood, and film grain controls appear in the creation flow, but their values are not passed to the final render. Caption font, color, and position are applied during rendering; the decorative caption presets shown in the editor are not fully reproduced in the exported video.

## Running the project locally

You will need Node.js and npm. The repository's CI workflow and Docker configuration use Node.js 22.

The app depends on cloud services even when you run it locally. Before generating a video, configure the following:

| Service | What it does |
| --- | --- |
| Firebase Authentication | Handles sign-in |
| Neon PostgreSQL | Stores users, video settings, job status, and asset links |
| Groq | Writes scripts and scene prompts |
| Google Gemini | Generates the voiceover |
| Cloudflare Workers AI | Generates scene images with FLUX Schnell |
| Deepgram | Transcribes the voiceover and provides word timestamps |
| Amazon S3 | Stores audio, images, and rendered videos |
| Remotion Lambda | Renders the MP4 on AWS |
| Inngest | Runs and recovers background jobs |

The [setup guide](SETUP.md) has more detail on AWS configuration and deployment.

### 1. Install dependencies

From the project directory, run:

```bash
npm install
```

### 2. Configure the environment

Create `.env.local` in the project root and fill in these values:

```dotenv
DATABASE_URL=your-neon-connection-string
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key

GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
DEEPGRAM_API_KEY=your-deepgram-api-key

REMOTION_AWS_ACCESS_KEY_ID=your-aws-access-key-id
REMOTION_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_SERVE_URL=your-deployed-remotion-site-url
ASSET_BUCKET=your-s3-asset-bucket
ASSET_REGION=us-east-1
```

Use your own Firebase project settings in [config/firebaseConfig.jsx](config/firebaseConfig.jsx). Only the API key comes from the environment; the other Firebase settings are currently defined in that file. Enable email/password and Google sign-in in your Firebase project.

Keep AI service keys in the server-side variables shown above. The code still accepts legacy `NEXT_PUBLIC_GEMINI_API_KEY` and `NEXT_PUBLIC_DEEPGRAM_API_KEY` values, but new setups should use `GEMINI_API_KEY` and `DEEPGRAM_API_KEY`.

These optional settings control models and concurrency:

| Variable | Default | Purpose |
| --- | --- | --- |
| `GROQ_SCRIPT_MODEL` | `openai/gpt-oss-120b` | Model used to write scripts |
| `GROQ_PROMPT_MODEL` | `openai/gpt-oss-20b` | Model used to write scene prompts |
| `IMAGE_CONCURRENCY` | `3` | Maximum simultaneous image requests per job |
| `RENDER_CONCURRENCY` | `8` | Number of parallel Lambda render chunks |

If `ASSET_BUCKET` is omitted, the storage helper derives it from `AWS_SERVE_URL`. Asset storage defaults to `us-east-1`, and the render pipeline currently uses that region explicitly.

### 3. Apply the database schema

Drizzle reads `DATABASE_URL` from `.env.local`. Run:

```bash
npx drizzle-kit push
```

This applies the schema in [configs/schema.js](configs/schema.js), including the video language field. If you already have a database from an earlier version, review the proposed changes before applying them.

You can browse the database with:

```bash
npx drizzle-kit studio
```

### 4. Configure video rendering

Deploy the Remotion Lambda function and the composition at [remotion/index.js](remotion/index.js), following [SETUP.md](SETUP.md). Set `AWS_SERVE_URL` to the deployed site's URL.

The app's audio and image URLs must be readable by Deepgram and the renderer. The storage helper tries a public-read upload, then retries without an ACL if the bucket disables ACLs. In that case, access depends on the bucket policy.

Changes to the Remotion composition require redeploying the Remotion site as well as updating the app.

### 5. Start both development servers

Start Next.js in one terminal:

```bash
npm run dev
```

Start Inngest in a second terminal:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Open the app at [localhost:3000](http://localhost:3000). You can inspect background jobs at [localhost:8288](http://localhost:8288).

Sign in and create a video to check the full flow. Both servers need to be running for local video generation.

### Using Docker Compose

The repository includes a Compose setup for Next.js and the Inngest development server:

```bash
docker compose up
```

It expects both `.env` and `.env.local` to exist. You still need to configure the cloud services, apply the database schema, and deploy Remotion separately. Docker starts the two local services; it does not provision those dependencies.

## How generation works

The API saves a video record before sending a `generate-video-data` event to Inngest. The background job then prepares assets in two parallel branches:

```text
Script -> Gemini voiceover -> S3 audio -> Deepgram captions
Script -> Groq scene prompts -> FLUX images -> S3 images
                                      |
                        Both branches finish
                                      |
                          Remotion Lambda render
                                      |
                           MP4 saved to S3
                                      |
                         Watch or download in app
```

Groq is prompted to plan five scenes, or four for an unusually short script. Remotion combines the generated images with pan and zoom motion, narration, and timed captions.

The pipeline writes progress to the database, and the interface polls for updates. Jobs move from `pending` to `generating`, then to `completed` or `failed`. Rendering begins at the 65% milestone, after all assets are ready, and subsequent progress comes from Remotion.

The main implementation is in [app/api/inngest/function.js](app/api/inngest/function.js).

### Retries and recovery

Temporary provider and upload failures have retry handling. Render progress is checked using durable five-second waits, so a server request does not have to stay open while the video renders. Rendering has a persisted 15-minute deadline.

A separate `recover-video-jobs` function runs every minute. It resends pending jobs older than one minute using the same event ID, allowing a saved request to recover if the original dispatch failed. The API returns HTTP 202 with the saved record ID when dispatch is deferred.

Pending jobs expire after 30 minutes. Generating jobs have a two-hour safety timeout measured from creation. Completed and failed records are protected from late pipeline updates. These recovery checks depend on Inngest and the database being available.

Deleting a video removes its database entry and attempts to delete its audio and scene images. The rendered MP4 is not deleted by that endpoint; its retention depends on the render bucket's lifecycle configuration.

## Working on the code

The project uses Next.js 15, React 18, JavaScript, Tailwind CSS 4, and Radix UI. Database access uses Drizzle ORM with Neon PostgreSQL.

| Location | What you will find |
| --- | --- |
| `app/(main)/` | Creation steps, dashboard, video library, progress, and playback pages |
| `app/api/` | Script and audio generation, video records, user sync, and Inngest routes |
| `app/_components/RemotionComposition.jsx` | The video composition used for preview and export |
| `_context/` | Authentication context and browser-saved creation state |
| `components/creation/` | Shared step navigation and live preview |
| `config/` | AI prompts, model settings, and Firebase configuration |
| `configs/` | Database connection and active Drizzle schema |
| `drizzle/` | SQL migrations and schema snapshots |
| `inngest/` | Shared Inngest client |
| `lib/` | Storage, audio conversion, voice direction, progress, and job recovery helpers |
| `public/voices/` | Recorded samples for the voice picker |
| `remotion/` | Render entry point and composition registration |
| `tests/` | Tests for generation and job recovery |

The database has two main tables: `users` and `video_data`. Video records store the selected language and settings, generated asset URLs, caption timestamps, progress, errors, and the final download URL. The full definitions live in [configs/schema.js](configs/schema.js).

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm test` | Run the generation and job recovery tests with mocked services |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run build` | Create a production build |
| `npm start` | Serve a production build |

The tests cover voice direction, scene prompts, failure handling, render deadlines, replay after a restart, and recovery from failed event dispatch. They do not call cloud services or render a real video.

## Deployment

The documented deployment uses Vercel for Next.js, Inngest Cloud for background jobs, and the same managed database, AI, and AWS services used during development.

Configure the app's environment variables on the host, plus `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` for production. Register `https://your-domain/api/inngest` with Inngest and confirm that both `generate-video-data` and `recover-video-jobs` are registered. The Remotion site and Lambda function are deployed separately.

See [SETUP.md](SETUP.md) for the deployment steps and troubleshooting notes.
