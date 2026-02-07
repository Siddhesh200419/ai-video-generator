import { generateScript } from "@/config/AiModel";
import { NextResponse } from "next/server";

const SCRIPT_PROMPT = `
write two different scripts for a 30-second video on Topic: {topic}.

- Write ONLY the spoken text, like a natural voiceover
- Avoid scene descriptions, character actions, or any visual cues
- Make sure the scripts sound engaging and smooth for a listener
- Keep it simple, conversational, and concise (around 100-120 words max per script)
- NO headings like "Voiceover:" or "Narrator:" - just give me the raw text
- Do not add any extra comments, notes, or explanations
- Return response STRICTLY in JSON format as:
{
  "scripts": [
    { "content": "" },
    { "content": "" }
  ]
}
`;


export async function POST(req) {
  try {
    const { topic } = await req.json();
    const PROMPT = SCRIPT_PROMPT.replace("{topic}", topic);

    const result = await generateScript.sendMessage(PROMPT);

    const resp = await result.response.text();

    // Optional - sometimes AI might add text before/after JSON, let's trim it
    const jsonStart = resp.indexOf("{");
    const jsonEnd = resp.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid JSON response from AI");
    }
    const cleanJSON = resp.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(cleanJSON);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}