import { generateScript } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { topic, theme } = await req.json();

    const selectedTopic = topic?.trim();
    const selectedTheme = theme?.trim();

    if (!selectedTopic && !selectedTheme) {
      return NextResponse.json(
        { error: "Please provide a topic or theme" },
        { status: 400 }
      );
    }

    let topicPromptDesc = "";
    if (selectedTopic && selectedTheme && selectedTopic.toLowerCase() !== selectedTheme.toLowerCase()) {
      topicPromptDesc = `Topic: "${selectedTopic}" within the Theme/Genre of "${selectedTheme}"`;
    } else {
      topicPromptDesc = `Topic / Theme: "${selectedTopic || selectedTheme}"`;
    }

    const PROMPT = `You are an elite YouTube Shorts storyteller and viral scriptwriter.
Write exactly two (2) distinct, compelling, and viral voiceover scripts for a 30-second YouTube Short on:
${topicPromptDesc}.

STRICT CONTENT & RELEVANCE RULES:
1. DIRECT RELEVANCE: The script must be 100% focused on "${selectedTopic || selectedTheme}". Every single sentence must tell a captivating story, explain a mind-bending fact, or deliver high-intensity intrigue directly about this subject.
2. NO GENERIC OR PROMOTIONAL FILLER: Absolutely NO generic advertising, NO "looking for stories?", NO "subscribe/visit website". Start immediately with the core story or fact.
3. SPOKEN VOICEOVER ONLY: Write ONLY the exact words that will be spoken by a voiceover narrator.
4. NO LABELS OR STAGE DIRECTIONS: Do NOT include ANY headings or tags like "Voiceover:", "Narrator:", "Scene 1:", "(Sound effect:)", or character actions. Raw spoken narration only.
5. DURATION & PACING: Each script must be strictly between 65 and 85 words long. This corresponds to exactly 25-30 seconds of spoken narration at a natural conversational pace.
6. FIRST-SECOND HOOK: Start with an irresistible hook sentence that grabs the viewer in the first 2 seconds.

Return response STRICTLY in valid JSON format:
{
  "scripts": [
    { "content": "Spoken voiceover script 1..." },
    { "content": "Spoken voiceover script 2..." }
  ]
}`;

    const result = await generateScript.sendMessage(PROMPT);
    const resp = await result.response.text();

    const jsonStart = resp.indexOf("{");
    const jsonEnd = resp.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid JSON response from AI");
    }
    const cleanJSON = resp.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(cleanJSON);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("API Error in generate-script:", err);
    return NextResponse.json(
      { error: "Failed to generate script", details: err?.message },
      { status: 500 }
    );
  }
}