const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = "AIzaSyAWj4nspoWwQ7Ot-rjZuDV3EIuDK5Wm9U0";
const genAI = new GoogleGenerativeAI(apiKey);

// Using the fixed model from AiModel.jsx
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

async function test() {
    try {
        console.log("Starting chat session with gemini-flash-latest...");
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const msg = "write two different scripts for a 30-second video on Topic: Kids Story. Return JSON.";
        console.log("Sending message:", msg);

        const result = await chatSession.sendMessage(msg);
        console.log("Response received.");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error details:", error);
    }
}

test();
