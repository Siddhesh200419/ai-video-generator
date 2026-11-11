import { NextResponse } from "next/server";

// Static catalogue of the voices the pipeline can synthesize. Each `id` MUST be
// a real Gemini prebuilt voice name, otherwise the pipeline silently falls back
// to "Kore" (see app/api/inngest/function.js).
//
// Nothing here is user-specific and it never changes at runtime, so the response
// is cached aggressively at the edge and in the browser.
const VOICES = [
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

export async function GET() {
  return NextResponse.json(
    { voices: VOICES },
    {
      headers: {
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
