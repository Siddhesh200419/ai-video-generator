import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiAudioToWav } from "@/lib/pcmToWav";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

/**
 * Full-script TTS for the video pipeline / occasional checks.
 * Voice picker previews should NOT call this (Gemini TTS daily quota).
 */
export async function POST(req) {
  try {
    const { script, voice, model = "gemini-3.8-flash-tts" } = await req.json();

    if (!script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const generativeModel = genAI.getGenerativeModel(
      { model: model || "gemini-3.8-flash-tts" },
      { apiVersion: "v1beta" },
    );

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: script }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" },
          },
        },
      },
    });

    const response = result.response;
    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData,
    );

    if (audioPart?.inlineData?.data) {
      const wavBuffer = geminiAudioToWav(
        audioPart.inlineData.data,
        audioPart.inlineData.mimeType,
      );
      return NextResponse.json({
        audioUrl: `data:audio/wav;base64,${wavBuffer.toString("base64")}`,
      });
    }

    console.error(
      "Gemini response did not contain audio data:",
      JSON.stringify(response),
    );
    return NextResponse.json(
      { error: "Model did not return audio data." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
