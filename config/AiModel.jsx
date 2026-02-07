const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const generateScript = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: "write a two different script for 30 Seconds video on Topic:Kids Story,\n\n- Give me response in JSON format and follow the schema\n-{\nscripts:[\n{\ncontent:''\n},\n],\n}\n",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "scripts": [\n    {\n      "content": "(Scene: Open on a close-up of a colorful children\'s book being opened.)\\n\\n**(Voiceover, warm and inviting):** Looking for magical adventures and heartwarming tales?\\n\\n(Scene: Quick cuts of kids reacting happily to a story being read. A parent reading to a child. An animated character dancing.)\\n\\n**(Voiceover):** Discover a world of captivating kids\' stories that spark imagination and create lasting memories. New adventures await!\\n\\n(Scene: The book\'s cover is shown prominently with website address below.)\\n\\n**(Voiceover):** Visit [Website Address] and start exploring today! Let the stories begin!"\n    },\n    {\n      "content": "(Scene: A child is lying in bed, looking bored. The room is dimly lit.)\\n\\n**(Sound:** Faint sigh of boredom)\\n\\n(Scene: Cut to a bright, inviting image of children laughing and engaging with a storybook, maybe even acted out a little bit.)\\n\\n**(Voiceover, energetic and playful):** Boredom? Not anymore!\\n\\n(Scene: Quick montage of diverse children listening to or reading stories - different ages and backgrounds.)\\n\\n**(Voiceover):** Unlock a treasure trove of exciting kids\' stories that entertain, educate, and inspire. Adventure is just a page away!\\n\\n(Scene: Website Address appears on screen with a call to action.)\\n\\n**(Voiceover):** Head to [Website Address] now and discover your next favorite story! "\n    }\n  ]\n}\n```',
        },
      ],
    },
  ],
});

export const GenerateImageScript = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "Generate Image prompt of Cinematic style with all details for each scene for 30 seconds video : script: Rosa Parks refused to give up her seat on a bus in 1955. Her quiet act of defiance sparked the Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement. One person's bravery can inspire lasting change for everyone.\n\n• Just Give specifying image prompt depends on the story line\n• do not give camera angle image prompt\n• Follow the Following schema and return JSON data (Max 4-5 Images)\n[\n    {\n        imagePrompt: '',\n        sceneContent: '<Script Content>'\n    }\n]\n"},
      ],
    },
    {
      role: "model",
      parts: [
        {text: "```json\n[\n    {\n        \"imagePrompt\": \"A crowded 1950s city bus. Rosa Parks, a dignified Black woman, sits calmly near the front. Other passengers are visible, a mix of Black and White individuals. The atmosphere is tense but outwardly normal.\",\n        \"sceneContent\": \"Rosa Parks refused to give up her seat on a bus in 1955.\"\n    },\n    {\n        \"imagePrompt\": \"A White bus driver looking sternly at Rosa Parks. A blurry background of other passengers and city streets through the bus windows. The lighting is slightly harsh to emphasize the conflict.\",\n        \"sceneContent\": \"Rosa Parks refused to give up her seat on a bus in 1955.\"\n    },\n    {\n        \"imagePrompt\": \"A wide shot of Black citizens of Montgomery, Alabama, walking down the street, boycotting the buses. Signs reading 'We Ride Together' are visible. The scene conveys determination and unity. The sky is overcast.\",\n        \"sceneContent\": \"Her quiet act of defiance sparked the Montgomery Bus Boycott, a pivotal moment in the Civil Rights Movement.\"\n    },\n    {\n        \"imagePrompt\": \"Close-up of Rosa Parks' face, aged but filled with wisdom and quiet strength. A montage of historical images of the Civil Rights Movement flashes in the background, subtly layered. \",\n        \"sceneContent\": \"One person's bravery can inspire lasting change for everyone.\"\n    }\n]\n```\n"},
      ],
    },
  ],
});

// const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
// console.log(result.response.text());
