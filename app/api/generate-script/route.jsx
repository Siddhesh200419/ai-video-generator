
import { generateScript } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const theme =
      typeof body.theme === "string" ? body.theme.trim() : "";

    // Validate input
    if (!topic && !title && !theme) {
      return NextResponse.json(
        {
          error: "Please provide a topic, title, or theme.",
        },
        { status: 400 }
      );
    }

    const PROMPT = `
Generate exactly two distinct YouTube Shorts voiceover scripts.

USER INPUT:

Topic: ${topic || "Not provided"}
Video Title: ${title || "Not provided"}
Theme/Genre: ${theme || "Not provided"}

INPUT PRIORITY:
- Topic defines the main subject of the video.
- Video Title defines the specific angle, hook, and story direction.
- Theme/Genre defines the storytelling style, mood, and atmosphere.
- Use all three inputs together when provided.
- Never ignore the provided video title.
- Both scripts must deliver on the central promise of the title.
- Do not simply repeat the title in the scripts.
- Do not introduce unrelated topics.
- If the topic is missing, use the title as the main subject.
- If the title is missing, develop an engaging angle from the topic.
- If the theme is missing, use a storytelling style suitable for the subject.

SCRIPT REQUIREMENTS:
- Generate exactly two distinct scripts.
- Each script must contain 65-85 words.
- Both scripts must follow all system instructions.
- Return valid JSON only, with a "scripts" array containing exactly two objects.
- Each object must have a string "content" property.
`;

    const result = await generateScript.sendMessage(PROMPT);
    const resp = await result.response.text();

    let parsed;

    try {
      parsed = JSON.parse(resp);
    } catch {
      console.error("Invalid JSON returned by the script model.");

      return NextResponse.json(
        {
          error: "The AI returned an invalid JSON response. Please try again.",
        },
        { status: 502 }
      );
    }

    // Validate response structure
    if (
      !parsed ||
      !Array.isArray(parsed.scripts) ||
      parsed.scripts.length !== 2 ||
      parsed.scripts.some(
        (script) =>
          !script ||
          typeof script.content !== "string" ||
          !script.content.trim()
      )
    ) {
      return NextResponse.json(
        {
          error: "The AI returned an unexpected script format. Please try again.",
        },
        { status: 502 }
      );
    }

    // Validate word count
    const invalidScripts = parsed.scripts.some((script) => {
      const wordCount = script.content.trim().split(/\s+/).length;
      return wordCount < 65 || wordCount > 85;
    });

    if (invalidScripts) {
      console.error("AI generated scripts outside the 65-85 word limit.");

      return NextResponse.json(
        {
          error: "The AI generated scripts outside the required word limit. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);

  } catch (err) {
    console.error("API Error in generate-script:", {
      status: err.status,
      code: err.code,
      message: err.message,
      requestId: err.headers?.["x-request-id"],
    });

    const status =
      Number.isInteger(err.status) &&
      err.status >= 400 &&
      err.status < 500
        ? err.status
        : 500;

    return NextResponse.json(
      {
        error: "Failed to generate script.",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : undefined,
      },
      { status }
    );
  }
}
