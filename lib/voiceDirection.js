// Gemini 3.8 accepts delivery direction separately from the spoken transcript.
// Keep these concise to preserve the selected voice's identity.
const deliveryStyles = {
  Kore: "Grounded, quietly intense storytelling, measured pace, deliberate emphasis and restrained suspense",
  Puck: "Soothing, reassuring and gentle, relaxed pace with soft emphasis and natural pauses",
  Charon: "Enthusiastic, confident and animated, lively conversational pace with clear emphasis, without shouting",
  Fenrir: "Poised, commanding and expressive, measured pace with purposeful emphasis",
  Zephyr: "Intimate, warm and conversational, relaxed rhythm with subtle emotional inflection",
  Aoede: "Playful, curious and expressive, lively rhythm with light emphasis",
  Orus: "Dramatic, compelling storytelling, controlled intensity with varied emphasis and brief pauses",
  Callirrhoe: "Soft, reflective and intriguing, unhurried rhythm with subtle suspense",
  Iapetus: "Determined, earnest and energetic, purposeful rhythm with strong but natural emphasis",
  Laomedeia: "Warm, empathetic storytelling, gentle emotional inflection with natural pauses",
};

const legacyNames = {
  "Grizzled Detective": "Kore",
  "Meditation Guide": "Puck",
  "Hype Announcer": "Charon",
  "Regal Monarch": "Fenrir",
  "Late-Night DJ": "Zephyr",
  "Cheeky Sidekick": "Aoede",
  "Epic Narrator": "Orus",
  "Mystical Seer": "Callirrhoe",
  "Action Hero": "Iapetus",
  "Kind Storyteller": "Laomedeia",
};

const supportedVoices = new Set([
  ...Object.keys(deliveryStyles),
  "Leda", "Autonoe", "Enceladus", "Umbriel", "Algieba", "Despina",
  "Erinome", "Algenib", "Rasalgethi", "Achernar", "Alnilam", "Schedar",
  "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix",
  "Sadachbia", "Sadaltager", "Sulafat",
]);

// Map app language IDs → Gemini speechConfig language codes.
// English is intentionally omitted so the API uses its default (auto-detect),
// which avoids accidentally forcing en-US on bilingual voices.
const LANGUAGE_CODES = {
  hindi:   "hi-IN",
  marathi: "mr-IN",
};

/**
 * Returns the BCP-47 language code for Gemini TTS, or null for English
 * (let Gemini auto-detect instead of hard-coding en-US).
 */
export function resolveLanguageCode(language) {
  return LANGUAGE_CODES[language?.toLowerCase()] ?? null;
}

export function resolveVoice(voice) {
  const requested = typeof voice === "string" ? voice.trim() : "";
  const resolved = Object.hasOwn(legacyNames, requested) ? legacyNames[requested] : requested;
  return supportedVoices.has(resolved) ? resolved : "Kore";
}

export function buildSpeechPart(script, voice, language) {
  const voiceName = resolveVoice(voice);
  const langCode = resolveLanguageCode(language);

  // Delivery style hint keeps the selected voice's character while switching language.
  const baseStyle = deliveryStyles[voiceName] ||
    "Expressive, conversational storytelling with varied intonation, natural pauses and clear emphasis";

  // Add language-specific instruction to the style so Gemini knows to speak
  // in Hindi/Marathi phonology even though the script is in Roman script.
  const languageHint =
    langCode === "hi-IN" ? ". Speak naturally in Hindi." :
    langCode === "mr-IN" ? ". Speak naturally in Marathi." :
    "";

  return {
    text: script,
    speechMetadata: {
      style: baseStyle + languageHint,
    },
  };
}
