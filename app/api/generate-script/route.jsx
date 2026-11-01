
import { generateScript } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";

    const theme =
      typeof body.theme === "string" ? body.theme.trim() : "";

    if (!topic && !theme) {
      return NextResponse.json(
        { error: "Please provide a topic or theme." },
        { status: 400 }
      );
    }

    const selectedTopic = topic || theme;
    const selectedTheme = theme || topic;

    const PROMPT = `
Topic: ${selectedTopic}
Theme/Genre: ${selectedTheme}

Generate exactly two distinct scripts following all system instructions.
Both scripts must contain 65-85 words.
Return a valid JSON object only, with a "scripts" array containing exactly two objects. Each object must have a string "content" property.
`;

    const result = await generateScript.sendMessage(PROMPT);
    const resp = await result.response.text();

    let parsed;

    try {
      parsed = JSON.parse(resp);
    } catch {
      console.error(
        "Invalid JSON returned by the script model."
      );

      return NextResponse.json(
        { error: "The AI returned an invalid JSON response. Please try again." },
        { status: 502 }
      );
    }

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
        { error: "The AI returned an unexpected script format. Please try again." },
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
