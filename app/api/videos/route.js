import { db } from "@/configs/db";
import { videoData } from "@/configs/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Pagination defaults. `limit` is clamped so a caller can never request the
// whole table in one shot.
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

// Thin projection for the video grid. It intentionally skips the heavy columns
// (`captionJson` word-level timestamps, `script`, `caption`) and extracts only
// the first scene image in SQL, so the full `images` array never crosses the
// wire just to render a thumbnail.
const listColumns = {
  id: videoData.id,
  title: videoData.title,
  topic: videoData.topic,
  status: videoData.status,
  currentStep: videoData.currentStep,
  progress: videoData.progress,
  downloadUrl: videoData.downloadUrl,
  createdAt: videoData.createdAt,
  thumbnailUrl: sql`${videoData.images}->>0`.as("thumbnail_url"),
};

// Dashboard tab → status filter, pushed to the database so pagination stays
// correct per tab instead of filtering a partially loaded page on the client.
const STATUS_FILTERS = {
  all: null,
  ready: ["completed"],
  rendering: ["pending", "generating"],
  failed: ["failed"],
};

// GET /api/videos?uid=<uuid>&status=<all|ready|rendering|failed>&limit=<n>&offset=<n>
// Returns a page of the user's videos, newest first.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const requestedLimit = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const requestedOffset = Number(searchParams.get("offset"));
    const offset =
      Number.isFinite(requestedOffset) && requestedOffset > 0
        ? Math.floor(requestedOffset)
        : 0;

    const statuses = STATUS_FILTERS[searchParams.get("status")] ?? null;

    const where = statuses
      ? and(eq(videoData.uid, uid), inArray(videoData.status, statuses))
      : eq(videoData.uid, uid);

    // Fetch one extra row to detect "has more" without a second COUNT query.
    const rows = await db
      .select(listColumns)
      .from(videoData)
      .where(where)
      .orderBy(desc(videoData.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const videos = hasMore ? rows.slice(0, limit) : rows;

    // Per-user data: never cache at the edge or in the browser.
    return NextResponse.json(
      { videos, hasMore, nextOffset: offset + videos.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[GET /api/videos] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
