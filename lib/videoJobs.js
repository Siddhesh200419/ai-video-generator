import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { and, eq, inArray, lt } from "drizzle-orm";

export const RENDER_TIMEOUT_MS = 15 * 60 * 1000;
export const DISPATCH_TIMEOUT_MS = 30 * 60 * 1000;
export const JOB_TIMEOUT_MS = 2 * 60 * 60 * 1000;

// Terminal records must never be revived by a late step or failure callback.
export const activeVideoJob = (recordId) =>
  and(
    eq(videoData.id, recordId),
    inArray(videoData.status, ["pending", "generating"]),
  );

export function failVideoJobs(condition, error) {
  return db
    .update(videoData)
    .set({
      status: "failed",
      errorMessage: (error?.message || String(error || "Video generation failed")).slice(0, 2000),
    })
    .where(and(condition, inArray(videoData.status, ["pending", "generating"])));
}

export const failVideoJob = (recordId, error) =>
  failVideoJobs(eq(videoData.id, recordId), error);

// The pending video row is the durable outbox. Both senders reconstruct the
// same event from it, including an ID that deduplicates ambiguous send failures.
export function videoJobEvent(video) {
  return {
    id: `generate-video-data-${video.id}`,
    name: "generate-video-data",
    data: {
      recordId: video.id,
      title: video.title,
      topic: video.topic,
      script: video.script,
      videoStyle: video.videoStyle,
      caption: video.caption,
      voice: video.voice,
      uid: video.uid,
      createdBy: video.createdBy,
    },
  };
}

export function expireVideoJobs(status, timeoutMs, message) {
  return failVideoJobs(
    and(
      eq(videoData.status, status),
      lt(videoData.createdAt, new Date(Date.now() - timeoutMs)),
    ),
    new Error(message),
  );
}
