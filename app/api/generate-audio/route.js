import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiAudioToWav } from "@/lib/pcmToWav";
import { buildSpeechPart, resolveVoice, resolveLanguageCode } from "@/lib/voiceDirection";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
);

/**
 * Full-script TTS for the video pipeline / occasional checks.
 * Voice picker previews should NOT call this (Gemini TTS daily quota).
 */
export async function POST(req) {
  try {
    const { script, voice, language, model = "gemini-3.8-flash-tts" } = await req.json();

    if (typeof script !== "string" || !script.trim()) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    const generativeModel = genAI.getGenerativeModel(
      { model: model || "gemini-3.8-flash-tts" },
      { apiVersion: "v1beta" },
    );

    const languageCode = resolveLanguageCode(language);

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [buildSpeechPart(script, voice, language)] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          ...(languageCode ? { languageCode } : {}),
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: resolveVoice(voice) },
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
