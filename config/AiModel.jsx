import { Groq } from "groq-sdk";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";

const SCRIPT_SYSTEM_PROMPT = `You are an elite YouTube Shorts storyteller and viral scriptwriter.

Write exactly two distinct, compelling voiceover scripts for a 30-second YouTube Short.

STRICT RULES:
1. Every sentence must directly relate to the requested topic.
2. No generic or promotional filler.
3. Output only the exact words spoken by the narrator.
4. No headings, labels, stage directions, or sound effects.
5. Each script must contain 65–85 words.
6. Start each script with a powerful hook that grabs attention in the first two seconds.
7. Make the two scripts meaningfully different in storytelling, hook, and angle.
8. Use natural, engaging narration suitable for AI voiceover.

Return strictly valid JSON in this exact format:
{
  "scripts": [
    { "content": "Complete voiceover script 1" },
    { "content": "Complete voiceover script 2" }
  ]
}

Do not include Markdown fences or commentary.`;

const SCRIPT_FEW_SHOT = [
  {
    role: "user",
    content:
      "Topic: The mysterious disappearances in the Bermuda Triangle.\nTheme/Genre: Dark mystery and ocean secrets.\n\nGenerate exactly two distinct scripts following all system instructions.\nBoth scripts must contain 65–85 words.\nReturn JSON only.",
  },
  {
    role: "assistant",
    content:
      '{"scripts":[{"content":"What if the ocean itself is swallowing ships whole? For decades, pilots and captains have vanished inside the Bermuda Triangle, leaving only baffling instrument readings and eerie silence. Satellite logs show sudden power loss, while weather patterns flip in seconds. Some survivors describe a luminous vortex pulling their hulls into darkness. Scientists debate magnetic anomalies, rogue waves, and secret military testing, but the water keeps its secrets, and the triangle remains a ghostly puzzle."},{"content":"Imagine charting a course and watching the horizon dissolve into nothingness. In the heart of the Atlantic, the Bermuda Triangle has claimed yachts, jets, and even whole crews without a trace. Deep-sea sonar sometimes picks up fleeting shadows, while declassified files hint at underwater methane eruptions that could erase vessels in an instant. Folklore speaks of a cursed portal, yet modern investigators focus on sensor glitches and rogue currents, still unable to explain the endless vanishing."}]}',
  },
];

const IMAGE_PROMPT_SYSTEM = `You are a visual director creating image prompts for an AI video generator.

Instructions:
1. Divide the script chronologically into exactly 4 to 5 distinct sequential scenes that visually narrate the entire story from start to finish.
2. For each scene, write a highly descriptive and visually evocative image prompt tailored for SDXL image generation.
3. Every prompt MUST directly illustrate the specific events, characters, environment, lighting, and mood described in that scene of the script.
4. Integrate the aesthetic details of the requested visual style (textures, color palette, lighting atmosphere).
5. DO NOT include any text, letters, watermarks, speech bubbles, camera angles (no "wide angle", "close-up"), or meta instructions in the image prompt. Describe purely the visual elements of the scene itself.
6. Return STRICTLY valid JSON in this exact format:
{
  "scenes": [
    {
      "sceneContent": "Brief 1-sentence summary of the scene from the script",
      "imagePrompt": "Detailed visual description of the scene in the requested style..."
    }
  ]
}

Do not include Markdown fences or commentary.`;

async function createJsonCompletion({ messages, temperature = 0.8 }) {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: GROQ_TEXT_MODEL,
    temperature,
    max_completion_tokens: 2048,
    top_p: 1,
    stream: false,
    reasoning_effort: "low",
    response_format: {
      type: "json_object",
    },
  });

  const content = chatCompletion.choices[0]?.message?.content || "";

  return {
    response: {
      text: async () => content,
    },
  };
}

export const generateScript = {
  sendMessage: async (prompt) => {

    return createJsonCompletion({
      messages: [
        { role: "system", content: SCRIPT_SYSTEM_PROMPT },
        ...SCRIPT_FEW_SHOT,
        { role: "user", content: prompt },
      ],
    });
  },
};

export const GenerateImageScript = {
  sendMessage: async (prompt) => {
    return createJsonCompletion({
      temperature: 0.7,
      messages: [
        { role: "system", content: IMAGE_PROMPT_SYSTEM },
        { role: "user", content: prompt },
      ],
    });
  },
};
