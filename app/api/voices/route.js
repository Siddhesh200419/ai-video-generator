import { NextResponse } from "next/server";

export async function GET() {
  // Pre-rendered sample clips live in /public/voices/<id>.wav (generated once by
  // scripts/generate-voice-samples.mjs). Do NOT live-call Gemini TTS here — the
  // previews must not consume the daily TTS quota.
  //
  // Every `id` below MUST be a real Gemini prebuilt voice name, otherwise the
  // pipeline silently falls back to "Kore" (see app/api/inngest/function.js).
  const voices = [
    { id: "Kore", name: "Grizzled Detective", description: "Low, gravelly noir" },
    { id: "Puck", name: "Meditation Guide", description: "Airy & soothing" },
    { id: "Charon", name: "Hype Announcer", description: "Booming arena energy" },
    { id: "Fenrir", name: "Regal Monarch", description: "Poised & commanding" },
    { id: "Zephyr", name: "Late-Night DJ", description: "Smooth & velvety" },
    { id: "Aoede", name: "Cheeky Sidekick", description: "Bright & playful" },
    { id: "Orus", name: "Epic Narrator", description: "Powerful & dramatic" },
    { id: "Callirrhoe", name: "Mystical Seer", description: "Wispy & ethereal" },
    { id: "Iapetus", name: "Action Hero", description: "Grit & determination" },
    { id: "Laomedeia", name: "Kind Storyteller", description: "Warm & gentle" },
  ].map((voice) => ({ ...voice, sampleUrl: `/voices/${voice.id}.wav` }));

  return NextResponse.json({ voices });
}
