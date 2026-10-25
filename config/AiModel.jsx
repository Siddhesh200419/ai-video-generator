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
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const generateScript = {
  sendMessage: async (prompt) => {
    return await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
  },
};

export const GenerateImageScript = {
  sendMessage: async (prompt) => {
    return await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
  },
};

