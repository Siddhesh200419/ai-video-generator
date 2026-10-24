import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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