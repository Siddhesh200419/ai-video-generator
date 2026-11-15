const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

// Run the actual route, job, and lifecycle helpers with isolated service
// adapters. No credentials, database, paid AI calls, or real timers are used.
async function harness(options = {}) {
  let now = Date.parse("2026-01-01T12:00:00Z");
  const rows = options.rows || [{
    id: "video-1", status: "pending", currentStep: "queued", progress: 0,
    createdAt: new Date(now), title: "Test", topic: "Space", script: "Hello",
    videoStyle: "Cinematic", voice: "Kore", uid: "user-1", createdBy: "test@example.com",
  }];
  const sent = [];
  const audioRequests = [];
  const storyboardRequests = [];
  const imageRequests = [];
  const attempts = new Map();
  const cache = new Map();
  const sleeps = [];
  let renders = 0;
  let polls = 0;
  const table = new Proxy({}, { get: (_, key) => key });
  const db = {
    update: () => ({ set: (values) => ({ where: (predicate) => {
      const execute = () => rows.filter(predicate).map((row) => Object.assign(row, values));
      return {
        then: (resolve, reject) => Promise.resolve().then(execute).then(resolve, reject),
        returning: async () => execute(),
      };
    } }) }),
    select: () => ({ from: () => ({ where: (predicate) => ({
      orderBy: () => ({ limit: async (limit) => rows.filter(predicate)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, limit) }),
    }) }) }),
    insert: () => ({ values: (values) => ({ returning: async () => {
      const row = { id: `video-${rows.length + 1}`, createdAt: new Date(now), ...values };
      rows.push(row);
      return [row];
    } }) }),
  };
  class NonRetriableError extends Error {}
  class Clock extends Date { static now() { return now; } }
  const context = vm.createContext({
    Date: Clock, Buffer, console: { log() {}, error() {} },
    setTimeout: (fn) => { fn(); },
    process: { env: { CLOUDFLARE_ACCOUNT_ID: "test", CLOUDFLARE_API_TOKEN: "test" } },
  });
  const send = async (events) => {
    sent.push(...(Array.isArray(events) ? events : [events]));
    if (options.dispatchFails) throw new Error("Event service unavailable");
    return { ids: sent.map((event) => event.id) };
  };
  const mocks = {
    "@/configs/db": { db },
    "@/configs/schema": { videoData: table },
    "drizzle-orm": {
      and: (...predicates) => (row) => predicates.every((predicate) => predicate(row)),
      eq: (key, value) => (row) => row[key] === value,
      inArray: (key, values) => (row) => values.includes(row[key]),
      lt: (key, value) => (row) => new Date(row[key]) < value,
      asc: (key) => key,
    },
    inngest: { NonRetriableError },
    "@/inngest/client": { inngest: {
      createFunction: (config, trigger, handler) => ({ config, trigger, handler }), send,
    } },
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
    "@/config/AiModel": { GenerateImageScript: { sendMessage: async (prompt) => {
      storyboardRequests.push(prompt);
      return ({
      response: { text: () => JSON.stringify({ scenes: [{ imagePrompt: "Space" }] }) },
    }); } } },
    "@google/generative-ai": { GoogleGenerativeAI: class {
      getGenerativeModel() { return { generateContent: async (request) => {
        audioRequests.push(request);
        return ({ response: {
        candidates: [{ content: { parts: [{ inlineData: { data: "audio" } }] } }],
      } }); } }; }
    } },
    "@deepgram/sdk": { createClient: () => ({ listen: { prerecorded: {
      transcribeUrl: async () => ({ result: { results: { channels: [{ alternatives: [{ words: [] }] }] } } }),
    } } }) },
    axios: { default: { post: async (_, body) => {
      imageRequests.push(body);
      return { data: { result: { image: Buffer.alloc(200).toString("base64") } } };
    } } },
    "@/lib/storage": { uploadFile: async (_, key) => {
      if (options.uploadFails) throw new Error("Upload unavailable");
      return `https://assets.test/${key}`;
    } },
    "@/lib/pcmToWav": { geminiAudioToWav: () => Buffer.from("wav") },
    "@remotion/lambda/client": {
      getFunctions: async () => [{ functionName: "renderer" }],
      renderMediaOnLambda: async () => { renders++; return { renderId: "render-1", bucketName: "renders" }; },
      getRenderProgress: async () => {
        polls++;
        return options.renderProgress ? options.renderProgress(polls) : { done: true, outputFile: "https://assets.test/video.mp4" };
      },
    },
  };
  const modules = new Map();
  async function load(id) {
    if (modules.has(id)) return modules.get(id);
    let module;
    if (mocks[id]) {
      const exports = mocks[id];
      module = new vm.SyntheticModule(Object.keys(exports), function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
      }, { context });
    } else {
      const filename = id.startsWith("@/lib/") ? `${id.slice(2)}.js` : id;
      module = new vm.SourceTextModule(await readFile(path.join(__dirname, "..", filename), "utf8"), { context, identifier: id });
    }
    modules.set(id, module);
    await module.link(load);
    return module;
  }
  const functions = await load("app/api/inngest/function.js");
  await functions.evaluate();
  const route = await load("app/api/generate-video-data/route.jsx");
  await route.evaluate();
  const audioRoute = await load("app/api/generate-audio/route.js");
  await audioRoute.evaluate();
  const { GenerateVideoData: job, RecoverVideoJobs: recovery } = functions.namespace;
  const step = {
    run: async (name, fn) => {
      if (cache.has(name)) return cache.get(name);
      for (let attempt = 0; ; attempt++) {
        attempts.set(name, (attempts.get(name) || 0) + 1);
        try {
          if (options.failStep === name) throw new Error(`${name} unavailable`);
          const result = await fn();
          cache.set(name, result);
          return result;
        } catch (error) {
          if (error instanceof NonRetriableError || attempt >= job.config.retries) throw error;
        }
      }
    },
    sleep: async (name, duration) => {
      if (cache.has(name)) return;
      assert.equal(duration, "5s");
      sleeps.push(name);
      now += 5000;
      cache.set(name, true);
      if (options.interruptSleep) { options.interruptSleep = false; throw new Error("Worker restarted"); }
    },
    sendEvent: async (_, events) => send(events),
  };
  const event = { data: { ...rows[0], recordId: rows[0]?.id } };
  const fail = (error) => job.config.onFailure({ event: { data: { event } }, error, step });
  const run = async () => {
    try { return await job.handler({ event, step }); }
    catch (error) { await fail(error); throw error; }
  };
  return {
    rows, sent, attempts, sleeps, cache, job, recovery, step, event, run, fail,
    audioRequests, storyboardRequests, imageRequests, audioPost: audioRoute.namespace.POST,
    post: route.namespace.POST, helpers: modules.get("@/lib/videoJobs").namespace,
    advance: (ms) => { now += ms; }, stats: () => ({ renders, polls }),
  };
}

test("pipeline and direct audio keep narration verbatim and apply the same voice direction", async () => {
  const h = await harness();
  const script = "Wait. That tiny light is a distant star!";
  h.event.data.script = script;
  h.event.data.voice = "Kind Storyteller";
  await h.run();
  const result = await h.audioPost({ json: async () => ({ script, voice: "Laomedeia" }) });
  assert.equal(result.status, 200);
  assert.equal(h.audioRequests.length, 2);
  for (const request of h.audioRequests) {
    const part = request.contents[0].parts[0];
    assert.equal(part.text, script);
    assert.match(part.speechMetadata.style, /empathetic/);
    assert.equal(request.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, "Laomedeia");
  }
  assert.deepEqual(h.audioRequests[0], h.audioRequests[1]);
});

test("storyboard preserves literal input and FLUX receives the standalone prompt without style overrides", async () => {
  const h = await harness();
  h.event.data.script = "A sign says $& near {style}.";
  h.event.data.topic = "A {script} story";
  h.event.data.videoStyle = "Watercolor";
  await h.run();
  const context = JSON.parse(h.storyboardRequests[0].split("Video context: ")[1]);
  assert.equal(context.script, h.event.data.script);
  assert.equal(context.topic, h.event.data.topic);
  assert.equal(context.videoStyle, "Watercolor");
  assert.equal(h.imageRequests[0].prompt, "Space");
});

test("direct audio rejects empty and non-text scripts before synthesis", async () => {
  const h = await harness();
  for (const script of [null, {}, "   "]) {
    const result = await h.audioPost({ json: async () => ({ script }) });
    assert.equal(result.status, 400);
  }
  assert.equal(h.audioRequests.length, 0);
});

for (const stage of ["GenerateAudioFile", "generateImagePrompt", "generateImages", "generateCaptions", "UpdateDB", "RenderVideo", "PollRender-0", "UpdateDownloadUrl"]) {
  test(`exhausted ${stage} retries reach failed`, async () => {
    const h = await harness({ failStep: stage });
    await assert.rejects(h.run(), new RegExp(`${stage} unavailable`));
    assert.equal(h.rows[0].status, "failed");
    assert.equal(h.rows[0].errorMessage, `${stage} unavailable`);
    assert.equal(h.attempts.get(stage), 3);
    assert.equal(h.attempts.get("MarkVideoFailed"), 1);
  });
}

test("exhausted storage upload retries reach failed", async () => {
  const h = await harness({ uploadFails: true });
  await assert.rejects(h.run(), /Upload unavailable/);
  assert.equal(h.rows[0].status, "failed");
});

test("fatal render errors fail immediately and retain the render milestone", async () => {
  const h = await harness({ renderProgress: () => ({ done: false, fatalErrorEncountered: true, errors: ["Lambda failed"] }) });
  await assert.rejects(h.run(), /Lambda failed/);
  assert.equal(h.rows[0].status, "failed");
  assert.equal(h.rows[0].currentStep, "render");
  assert.equal(h.attempts.get("PollRender-0"), 1);
  assert.equal(h.sleeps.length, 0);
});

test("an unfinished render expires after durable waits", async () => {
  const h = await harness({ renderProgress: () => ({ done: false, overallProgress: 0.5 }) });
  await assert.rejects(h.run(), /Render deadline exceeded/);
  assert.equal(h.rows[0].status, "failed");
  assert.equal(h.sleeps.length, 180);
  assert.equal(h.stats().renders, 1);
});

test("replay retains the render ID and original deadline after a worker restart", async () => {
  const h = await harness({ interruptSleep: true, renderProgress: () => ({ done: false }) });
  await assert.rejects(h.job.handler({ event: h.event, step: h.step }), /Worker restarted/);
  h.advance(16 * 60_000);
  await assert.rejects(h.run(), /Render deadline exceeded/);
  assert.equal(h.stats().renders, 1);
  assert.equal(h.stats().polls, 1);
  assert.equal(h.attempts.get("RenderDeadline"), 1);
  assert.equal(h.rows[0].status, "failed");
});

test("successful render completes and late failures cannot overwrite it", async () => {
  const h = await harness({ renderProgress: (poll) => poll === 1
    ? { done: false, overallProgress: 0.5 }
    : { done: true, outKey: "video.mp4" } });
  await h.run();
  await h.fail(new Error("Late failure"));
  assert.equal(h.rows[0].status, "completed");
  assert.equal(h.rows[0].progress, 100);
  assert.equal(h.rows[0].errorMessage, null);
  assert.equal(h.rows[0].downloadUrl, "https://renders.s3.us-east-1.amazonaws.com/video.mp4");
  assert.equal(h.sleeps.length, 1);
});

test("a completed render without output fails", async () => {
  const h = await harness({ renderProgress: () => ({ done: true }) });
  await assert.rejects(h.run(), /without an output file/);
  assert.equal(h.rows[0].status, "failed");
});

test("late pipeline writes cannot revive a failed video", async () => {
  const h = await harness({ renderProgress: () => {
    h.rows[0].status = "failed";
    h.rows[0].errorMessage = "Expired by recovery";
    return { done: true, outputFile: "https://assets.test/late.mp4" };
  } });
  await h.run();
  assert.equal(h.rows[0].status, "failed");
  assert.equal(h.rows[0].errorMessage, "Expired by recovery");
  assert.equal(h.rows[0].downloadUrl, undefined);
});

test("terminal records reject delayed dispatch before any paid work", async () => {
  const h = await harness();
  h.rows[0].status = "failed";
  await assert.rejects(h.run(), /already terminal/);
  assert.equal(h.attempts.get("GenerateAudioFile"), undefined);
  assert.equal(h.rows[0].status, "failed");
});

test("failed dispatch returns the saved record ID and recovery sends the identical event", async () => {
  const options = { dispatchFails: true };
  const h = await harness(options);
  const response = await h.post({ json: async () => ({ ...h.rows[0], title: "  Space  " }) });
  assert.equal(response.status, 202);
  assert.equal(response.body.recordId, "video-2");
  assert.equal(h.rows[1].status, "pending");
  assert.equal(h.sent[0].data.title, "Space");
  options.dispatchFails = false;
  h.advance(2 * 60_000);
  await h.recovery.handler({ step: h.step });
  const resent = h.sent.find((event, index) => index > 0 && event.data.recordId === "video-2");
  assert.deepEqual(resent, h.sent[0]);
  assert.equal(h.job.config.idempotency, "event.data.recordId");
});

test("recovery expires old pending/generating jobs, preserves terminal jobs, and skips fresh rows", async () => {
  const now = Date.parse("2026-01-01T12:00:00Z");
  const row = (id, status, minutes) => ({ id, status, createdAt: new Date(now - minutes * 60_000) });
  const h = await harness({ rows: [
    row("pending-old", "pending", 31), row("running-old", "generating", 121),
    row("done", "completed", 180), row("failed", "failed", 180),
    row("fresh", "pending", 0), row("recoverable", "pending", 2),
    row("running", "generating", 10),
  ] });
  await h.recovery.handler({ step: h.step });
  assert.deepEqual(h.rows.map((row) => row.status), ["failed", "failed", "completed", "failed", "pending", "pending", "generating"]);
  assert.match(h.rows[0].errorMessage, /dispatch deadline/);
  assert.match(h.rows[1].errorMessage, /generation deadline/);
  assert.deepEqual(h.sent.map((event) => event.data.recordId), ["recoverable"]);
});

test("persistent dispatch failure eventually expires instead of stranding pending rows", async () => {
  const h = await harness({ dispatchFails: true });
  h.advance(2 * 60_000);
  const result = await h.recovery.handler({ step: h.step });
  assert.equal(result.deferred, 1);
  assert.equal(h.rows[0].status, "pending");
  h.advance(30 * 60_000);
  h.cache.clear(); // A new cron run, with a fresh durable step journal.
  await h.recovery.handler({ step: h.step });
  assert.equal(h.rows[0].status, "failed");
});

test("transient polling errors retry the poll without submitting another render", async () => {
  const h = await harness({ renderProgress: (poll) => {
    if (poll === 1) throw new Error("Temporary AWS error");
    return { done: true, outputFile: "https://assets.test/video.mp4" };
  } });
  await h.run();
  assert.equal(h.rows[0].status, "completed");
  assert.equal(h.attempts.get("PollRender-0"), 2);
  assert.equal(h.stats().renders, 1);
});
