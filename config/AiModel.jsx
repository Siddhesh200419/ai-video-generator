const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const textModelName = "gemini-3.8-flash";

const model = genAI.getGenerativeModel({
  model: textModelName,
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
    // #region debug-point A:text-model-request
    (() => {
      const fs = require("fs");
      let url = "http://127.0.0.1:7777/event";
      let sessionId = "gemini-script-404";
      try {
        const envText = fs.readFileSync(".dbg/gemini-script-404.env", "utf8");
        url = envText.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || url;
        sessionId = envText.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId;
      } catch {}
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          runId: "pre-fix",
          hypothesisId: "A",
          location: "config/AiModel.jsx:generateScript",
          msg: "[DEBUG] generateScript.sendMessage invoked",
          data: { model: textModelName, promptLength: prompt?.length ?? 0 },
          ts: Date.now(),
        }),
      }).catch(() => {});
    })();
    // #endregion
    try {
      return await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });
    } catch (error) {
      // #region debug-point A:text-model-error
      (() => {
        const fs = require("fs");
        let url = "http://127.0.0.1:7777/event";
        let sessionId = "gemini-script-404";
        try {
          const envText = fs.readFileSync(".dbg/gemini-script-404.env", "utf8");
          url = envText.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || url;
          sessionId = envText.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId;
        } catch {}
        fetch(url, {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            runId: "pre-fix",
            hypothesisId: "A",
            location: "config/AiModel.jsx:generateScript",
            msg: "[DEBUG] generateScript.sendMessage failed",
            data: {
              model: textModelName,
              message: error?.message,
              status: error?.status,
              statusText: error?.statusText,
            },
            ts: Date.now(),
          }),
        }).catch(() => {});
      })();
      // #endregion
      throw error;
    }
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

