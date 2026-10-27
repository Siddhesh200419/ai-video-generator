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
        { status: 400 },
      );
    }

    let topicPromptDesc = "";
    if (
      selectedTopic &&
      selectedTheme &&
      selectedTopic.toLowerCase() !== selectedTheme.toLowerCase()
    ) {
      topicPromptDesc = `Topic: ${selectedTopic}\nTheme/Genre: ${selectedTheme}`;
    } else {
      topicPromptDesc = `Topic: ${selectedTopic || selectedTheme}\nTheme/Genre: ${selectedTopic || selectedTheme}`;
    }

    // This was the missing piece: build the prompt that gets sent to the model.
    // The format matches the few-shot example in AiModel.js.
    const PROMPT = `${topicPromptDesc}

Generate exactly two distinct scripts following all system instructions.
Both scripts must contain 65-85 words.
Return JSON only.`;

    const result = await generateScript.sendMessage(PROMPT);
    const resp = await result.response.text();

    const jsonStart = resp.indexOf("{");
    const jsonEnd = resp.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Invalid JSON response from AI");
    }
    const cleanJSON = resp.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(cleanJSON);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("API Error in generate-script:", err);
    return NextResponse.json(
      { error: "Failed to generate script", details: err?.message },
      { status: 500 },
    );
  }
}