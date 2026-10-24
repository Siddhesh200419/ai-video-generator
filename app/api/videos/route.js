import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/videos?uid=<user_uuid>
// Returns all videos for the given user, newest first.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const videos = await db
      .select()
      .from(videoData)
      .where(eq(videoData.uid, uid))
      .orderBy(desc(videoData.createdAt));

    return NextResponse.json(videos);
  } catch (error) {
    console.error("[GET /api/videos] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
