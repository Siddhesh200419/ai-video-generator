import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
import { videoJobEvent } from "@/lib/videoJobs";

export async function POST(req) {
  try {
    const body = await req.json();
    let { title, topic, script, videoStyle, caption, voice, uid, createdBy } = body;

    // Sanitize title so single-letter artifacts like 'w' never persist
    if (!title || title.trim() === "w" || title.trim() === "W") {
      title = (typeof topic === "string" && topic.trim()) ? topic.trim() : "Untitled Short";
    } else {
      title = title.trim();
    }

    // 1. Validate required fields
    if (!uid || !title || !topic || !script || !videoStyle || !voice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Insert video record with status = 'pending'
    const [newVideo] = await db
      .insert(videoData)
      .values({
        title,
        topic,
        script,
        videoStyle,
        caption,
        voice,
        uid,
        createdBy,
        status: "pending",
      })
      .returning();

    // The committed pending row is also the outbox. If sending fails (or this
    // request dies here), the recovery function sends the same event later.
    try {
      await inngest.send(videoJobEvent(newVideo));
    } catch (error) {
      console.error("[POST /api/generate-video-data] Dispatch deferred:", error);
      return NextResponse.json(
        { recordId: newVideo.id, video: newVideo },
        { status: 202 },
      );
    }

    return NextResponse.json({ recordId: newVideo.id, video: newVideo });
  } catch (error) {
    console.error("[POST /api/generate-video-data] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
