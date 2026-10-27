import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, topic, script, videoStyle, caption, voice, uid, createdBy } = body;

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

    // 3. Dispatch Inngest background job with the new record ID
    await inngest.send({
      name: "generate-video-data",
      data: {
        ...body,
        recordId: newVideo.id,
      },
    });

    return NextResponse.json({ recordId: newVideo.id, video: newVideo });
  } catch (error) {
    console.error("[POST /api/generate-video-data] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
