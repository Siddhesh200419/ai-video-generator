const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = "Your-API-Key";
const genAI = new GoogleGenerativeAI(apiKey);

async function test(name) {
    try {
        console.log(`Testing ${name}...`);
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Hi");
        console.log(`[PASS] ${name}`);
        return true;
    } catch (e) {
        console.log(`[FAIL] ${name}: ${e.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    await test("gemini-flash-latest");
    await test("gemini-2.0-flash-lite-001");
    // gemini-1.5-pro might be available?
    await test("gemini-1.5-pro");
}

run();
