/**
 * Wrap raw 16-bit PCM in a WAV (RIFF) header so browsers, Remotion, and Deepgram can play it.
 */
export function pcmToWav(
  pcmBuffer,
  { sampleRate = 24000, numChannels = 1, bitsPerSample = 16 } = {},
) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

/**
 * Normalize Gemini TTS inline audio into a playable WAV buffer.
 * Unary Gemini 3.8 may already return WAV; older / L16 responses need a header.
 */
export function geminiAudioToWav(base64Data, mimeType = "") {
  const raw = Buffer.from(base64Data, "base64");
  const mime = (mimeType || "").toLowerCase();

  if (raw.length >= 4 && raw.toString("ascii", 0, 4) === "RIFF") {
    return raw;
  }
  if (mime.includes("wav") || mime.includes("wave")) {
    return raw;
  }

  let sampleRate = 24000;
  const rateMatch = mime.match(/rate=(\d+)/i);
  if (rateMatch) sampleRate = Number(rateMatch[1]);

  return pcmToWav(raw, { sampleRate });
}
