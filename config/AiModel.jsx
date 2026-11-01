
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";

/* -------------------------------------------------------------------------- */
/*                               SCRIPT PROMPT                                */
/* -------------------------------------------------------------------------- */

const SCRIPT_SYSTEM_PROMPT = `
You are an elite YouTube Shorts scriptwriter whose videos hold viewers' attention.

Write exactly two distinct voiceover scripts for a 30-second vertical video about the user's topic and theme.

STRUCTURE
Each script must follow this storytelling arc without labeling it:
1. HOOK: The first one or two sentences, under 12 words. Use a shocking fact, bold claim, surprising question, or vivid scenario. Never start with "Did you know", "Have you ever wondered", "Welcome", "Today", or "In this video".
2. BUILD: Three or four sentences with concrete details such as names, places, years, numbers, and sensory images. Each sentence must add a new fact or image.
3. TURN: One sentence with a twist, surprising explanation, or striking detail.
4. PAYOFF: One or two memorable closing sentences. Do not include calls to action.

STYLE RULES
- Use short, punchy sentences. Average 8-14 words per sentence.
- Use vivid, concrete, visual language.
- Include specific details whenever they are accurate.
- Only state facts you are confident are true.
- Frame myths and legends as beliefs, not established facts.
- Match the requested theme and genre.

VOICEOVER FORMATTING
- Write numbers and years as spoken words.
- Do not use abbreviations, hashtags, emojis, parentheses, bullet points, or symbols.
- Use only periods, commas, question marks, and occasional dashes for natural pacing.

HARD RULES
- Every sentence must relate directly to the requested topic.
- Output only words spoken by the narrator.
- Do not include headings, labels, stage directions, or sound effects.
- Each script must contain 65-85 words.
- Both scripts must differ meaningfully in their hooks, angles, and storytelling approaches.
- Both scripts must follow the requested theme and genre.

OUTPUT FORMAT
Return valid JSON only, with exactly this structure:
{
  "scripts": [
    { "content": "Complete voiceover script 1" },
    { "content": "Complete voiceover script 2" }
  ]
}

Do not include Markdown fences or commentary.
`;

const SCRIPT_FEW_SHOT = [
  {
    role: "user",
    content:
      "Topic: The mysterious disappearances in the Bermuda Triangle.\n" +
      "Theme/Genre: Dark mystery and ocean secrets.\n\n" +
      "Generate exactly two distinct scripts following all system instructions.\n" +
      "Both scripts must contain 65-85 words.\n" +
      "Return JSON only.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      scripts: [
        {
          content:
            "Five bombers. Gone in one afternoon. In nineteen forty-five, Flight Nineteen flew into the Bermuda Triangle on a routine training run. Then the compass failed. The leader radioed that nothing looked right, and even the ocean seemed wrong. Rescue planes launched, and one of them vanished too. No wreckage was ever found. Experts blame storms and human error, yet one question still haunts investigators: why did every radio fall silent at once?",
        },
        {
          content:
            "Your compass is spinning, and the sea looks perfectly calm. That is what the Bermuda Triangle does to sailors, or so the legends say. The truth is stranger. Researchers point to sudden storms, powerful Gulf Stream currents, and plain human error. Yet some wrecks vanish with no distress call at all. So is it myth, or just the ocean hiding evidence? Next time someone tells you nothing explains it, remember that the deep keeps its own records.",
        },
      ],
    }),
  },
];

/* -------------------------------------------------------------------------- */
/*                              IMAGE PROMPT SYSTEM                           */
/* -------------------------------------------------------------------------- */

const IMAGE_PROMPT_SYSTEM = `
You are an award-winning visual director and storyboard artist creating image prompts for an AI video generator using SDXL.

PROCESS
1. Read the entire script and decide on one consistent visual identity, including subjects, setting, color palette, lighting, and art style.
2. Split the script chronologically into exactly five scenes. Use four only if the script is extremely short.
3. Write one imagePrompt for each scene.

IMAGE PROMPT RULES
- Illustrate the literal events, subjects, objects, and emotions of the relevant script section.
- Scene one must be striking and match the hook.
- Structure prompts using the main subject, supporting details, environment, lighting, palette, mood, and style.
- Use concrete visual details, materials, textures, weather, and light sources.
- Keep subjects, colors, and lighting consistent across scenes.
- Respect the requested visual style.
- Compose for a vertical 9:16 frame with a clear focal subject and depth.
- Each imagePrompt must contain 45-80 words.
- Describe only visible elements using positive descriptions.
- Do not include text, letters, numbers, logos, watermarks, speech bubbles, captions, or camera lens terminology.
- Do not use names of real people, celebrities, or copyrighted characters.
- Keep content non-graphic and suitable for general audiences.
- End each prompt with suitable quality tags.

SCENE CONTENT
sceneContent must be a brief, one-sentence summary of the relevant script section, in chronological order.

OUTPUT
Return strictly valid JSON in exactly this format:
{
  "scenes": [
    {
      "sceneContent": "Brief summary of the scene",
      "imagePrompt": "Detailed visual description in the requested style"
    }
  ]
}

Do not include Markdown fences or commentary.
`;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

async function createJsonCompletion({
  messages,
  temperature = 0.8,
}) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: GROQ_TEXT_MODEL,
      temperature,
      max_completion_tokens: 4096,
      response_format: {
        type: "json_object",
      },
      stream: false,
    });

    const content =
      chatCompletion.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Groq returned an empty response.");
    }

    // Verify that the response is valid JSON before returning it.
    JSON.parse(content);

    return {
      response: {
        text: async () => content,
      },
    };
  } catch (error) {
    console.error("Groq JSON completion failed:", {
      status: error.status,
      code: error.code,
      message: error.message,
      requestId: error.headers?.["x-request-id"],
    });

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export const generateScript = {
  sendMessage: async (prompt) => {
    return createJsonCompletion({
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: SCRIPT_SYSTEM_PROMPT,
        },
        ...SCRIPT_FEW_SHOT,
        {
          role: "user",
          content: prompt,
        },
      ],
    });
  },
};

export const GenerateImageScript = {
  sendMessage: async (prompt) => {
    return createJsonCompletion({
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: IMAGE_PROMPT_SYSTEM,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
  },
};
