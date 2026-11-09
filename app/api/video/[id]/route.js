import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { deleteFiles } from "@/lib/storage";

// GET /api/video/[id]
// Returns a single video record by its UUID.
// Polled by VideoList and play-video page to track status.
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const [video] = await db
      .select()
      .from(videoData)
      .where(eq(videoData.id, id))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("[GET /api/video/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/video/[id]?uid=<user_uuid>
// Removes the database record and best-effort cleans up its S3 assets
// (audio + scene images). The rendered MP4 lives in Remotion's own bucket
// and is left to expire via its lifecycle rule.
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const [video] = await db
      .select()
      .from(videoData)
      .where(eq(videoData.id, id))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    if (video.uid !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the DB row first — it is the source of truth, so a storage
    // hiccup can never leave an undeletable record behind.
    await db.delete(videoData).where(eq(videoData.id, id));

    // Best-effort asset cleanup (keys are derived, no bucket listing needed).
    const keys = [];
    if (video.audioUrl) keys.push(`audio/${id}.wav`);
    const imageCount = Array.isArray(video.images) ? video.images.length : 0;
    for (let i = 0; i < imageCount; i++) {
      keys.push(`images/${id}/scene-${i}.jpg`);
    }
    await deleteFiles(keys);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/video/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}