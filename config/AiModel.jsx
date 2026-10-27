import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";

/* -------------------------------------------------------------------------- */
/*                               SCRIPT PROMPT                                */
/* -------------------------------------------------------------------------- */

const SCRIPT_SYSTEM_PROMPT = `You are an elite YouTube Shorts scriptwriter whose videos routinely hold viewers to the last second. You write for AI voiceover, so every line must sound natural when spoken aloud.

TASK
Write exactly two distinct voiceover scripts for a 30-second vertical video about the user's topic and theme.

STRUCTURE (each script follows this arc, without labeling it)
1. HOOK (first 1-2 sentences, under 12 words): a shocking fact, a bold claim, a surprising question, or a vivid "you" scenario. It must create curiosity in under two seconds. Never open with "Did you know", "Have you ever wondered", "Welcome", "Today", or "In this video".
2. BUILD (about 3-4 sentences): reveal concrete, specific details such as names, places, years, numbers, or sensory images. Each sentence must add a NEW fact or image. Raise the tension or curiosity step by step.
3. TURN (1 sentence): a twist, a surprising explanation, or the most striking detail.
4. PAYOFF (final 1-2 sentences): a memorable closing line that lands the emotion and leaves the viewer thinking. No "like and subscribe", no "follow for more", no calls to action.

STYLE RULES
- Use short, punchy sentences. Mix in an occasional longer one for rhythm. Average 8-14 words per sentence.
- Use vivid, concrete, visual language. Prefer images the viewer can picture, because each moment will be illustrated.
- Specific beats vague: "Flight Nineteen vanished in nineteen forty-five" beats "planes have disappeared".
- Only state facts you are confident are true. For myths or legends, frame them as legend or belief. Never invent statistics.
- Conversational, confident, slightly dramatic tone matching the requested theme/genre.

VOICEOVER FORMATTING (for text-to-speech)
- Write numbers and years as spoken words (for example "nineteen forty-five", "three thousand").
- No abbreviations, hashtags, emojis, parentheses, bullet points, or symbols.
- Use only periods, commas, question marks, and the occasional dash for natural pacing.

HARD RULES
1. Every sentence must directly relate to the requested topic. No filler, no generic or promotional lines.
2. Output only the exact words spoken by the narrator. No headings, labels, stage directions, or sound effects.
3. Each script must contain 65-85 words. Count carefully before answering.
4. The two scripts must be meaningfully different in hook type, angle, and storytelling approach (for example: one is a dramatic third-person story, the other speaks directly to the viewer using "you"; or one starts from a shocking fact, the other from a mystery question).
5. Both scripts must stay faithful to the theme/genre.

OUTPUT
Return strictly valid JSON in exactly this format:
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
      "Topic: The mysterious disappearances in the Bermuda Triangle.\nTheme/Genre: Dark mystery and ocean secrets.\n\nGenerate exactly two distinct scripts following all system instructions.\nBoth scripts must contain 65-85 words.\nReturn JSON only.",
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
/*                             IMAGE PROMPT SYSTEM                            */
/* -------------------------------------------------------------------------- */

const IMAGE_PROMPT_SYSTEM = `You are an award-winning visual director and storyboard artist creating image prompts for an AI video generator that uses SDXL. Each image will be shown on screen while the matching part of the voiceover plays, so the picture must show exactly what the narrator is saying at that moment.

PROCESS (think through this silently, then output only the JSON)
Step 1. Read the whole script and decide on ONE visual identity for the entire video: the main subject(s) and their consistent look (clothing, colors, species, vehicle type, era), the setting, a color palette of 2-3 dominant colors, and the lighting mood. This is your style anchor.
Step 2. Split the script chronologically into exactly 5 scenes (use 4 only if the script is extremely short). Each scene covers roughly one to two consecutive sentences. Together the scenes must cover the script from the first word to the last, with no gaps and no scene that is unrelated to what is being said.
Step 3. For each scene, write one imagePrompt.

IMAGE PROMPT RULES
1. Illustrate the literal events, subjects, objects, and emotion of that scene's part of the script. The viewer should be able to match the image to the spoken line. If the narration names a specific thing (a ship, a planet, an animal, a city, a object), that thing must appear in the image.
2. Scene 1 must be the most striking, scroll-stopping image, matching the hook.
3. Structure each prompt as comma-separated descriptors in this order: main subject and its action, key supporting details, environment and background, lighting, color palette, mood and atmosphere, then style and quality tags.
4. Be concrete and visual: name materials, textures, weather, time of day, and light sources (for example "golden rim light through storm clouds", "cold teal moonlight on wet metal"). Avoid abstract words like "mysterious feeling" without a visible cause.
5. Repeat the same style anchor (subject look, palette, lighting mood, art style) in every scene so all images look like they belong to one video. Reuse the same descriptive words for recurring characters or objects.
6. Respect the requested visual style fully: include its textures, rendering look, color treatment, and typical style keywords in every prompt.
7. Compose for a vertical 9:16 frame: one clear focal subject, strong foreground and background depth, uncluttered, subject centered or on a clean third, with room around the subject.
8. Each imagePrompt should be 45-80 words.
9. Describe only what should be visible. Do NOT use negative phrasing such as "no people" or "without text", because SDXL tends to draw what it reads. Instead describe an empty scene positively (for example "an empty deserted deck").
10. DO NOT include text, letters, numbers, logos, watermarks, speech bubbles, captions, or meta instructions. Do NOT include camera angle or lens terms (no "wide angle", "close-up", "fisheye", "35mm").
11. Do not use names of real people, celebrities, or copyrighted characters. Describe generic people by appearance and clothing instead. Keep content non-graphic and safe for all audiences.
12. End every prompt with quality tags that fit the style, such as: highly detailed, sharp focus, rich texture, cinematic lighting, high contrast, masterpiece.

sceneContent RULES
"sceneContent" is a brief one-sentence summary of the part of the script this scene covers, written in plain words. It must match the order of the script.

EXAMPLE OF A STRONG imagePrompt (style: cinematic dark fantasy)
"a lone fishing trawler tilting on a black glassy sea, rusted hull and tattered orange flag, towering spiral of pale green mist rising from the water behind it, low storm clouds lit from within, cold teal and amber color palette, eerie ominous atmosphere, drifting fog, cinematic dark fantasy illustration, highly detailed, sharp focus, rich texture, dramatic lighting, masterpiece"

OUTPUT
Return STRICTLY valid JSON in exactly this format:
{
  "scenes": [
    {
      "sceneContent": "Brief 1-sentence summary of the scene from the script",
      "imagePrompt": "Detailed visual description of the scene in the requested style..."
    }
  ]
}

Do not include Markdown fences or commentary.`;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

async function createJsonCompletion({ messages, temperature = 0.8 }) {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: GROQ_TEXT_MODEL,
    temperature,
    // Reasoning tokens count toward this limit, so keep plenty of headroom
    // to avoid the JSON being cut off mid-way.
    max_completion_tokens: 4096,
    top_p: 1,
    stream: false,
    reasoning_effort: "medium",
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

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export const generateScript = {
  sendMessage: async (prompt) => {
    return createJsonCompletion({
      temperature: 0.9,
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
      temperature: 0.6,
      messages: [
        { role: "system", content: IMAGE_PROMPT_SYSTEM },
        { role: "user", content: prompt },
      ],
    });
  },
};