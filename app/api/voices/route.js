import { NextResponse } from "next/server";

export async function GET() {
  // sampleUrl: optional static preview file. Do NOT live-call Gemini TTS here (daily quota).
  const voices = [
    { id: "Kore", name: "Grizzled Detective", description: "Low, gravelly noir", sampleUrl: null },
    { id: "Puck", name: "Meditation Guide", description: "Airy & soothing", sampleUrl: null },
    { id: "Charon", name: "Hype Announcer", description: "Booming arena energy", sampleUrl: null },
    { id: "Fenrir", name: "Regal Monarch", description: "Poised & commanding", sampleUrl: null },
    { id: "Zephyr", name: "Late-Night DJ", description: "Smooth & velvety", sampleUrl: null },
    { id: "Aoede", name: "Cheeky Sidekick", description: "Bright & playful", sampleUrl: null },
    { id: "Helios", name: "Epic Narrator", description: "Powerful & dramatic", sampleUrl: null },
    { id: "Cassiopeia", name: "Mystical Seer", description: "Wispy & ethereal", sampleUrl: null },
    { id: "Orion", name: "Action Hero", description: "Grit & determination", sampleUrl: null },
    { id: "Lyra", name: "Kind Storyteller", description: "Warm & gentle", sampleUrl: null },
  ];

  return NextResponse.json({ voices });
}
