import { db } from "@/configs/db";
import { users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST /api/user
// Creates a new user if they don't exist, returns the user record either way.
// Called from provider.js on Firebase auth state change.
export async function POST(req) {
  try {
    const { name, email, pictureURL } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      const existingUser = existing[0];
      // Refresh profile fields if they changed (e.g. name set right after
      // email/password sign-up, or photo added on first Google sign-in)
      const updates = {};
      if (name && name !== existingUser.name) updates.name = name;
      if (pictureURL && pictureURL !== existingUser.pictureURL)
        updates.pictureURL = pictureURL;
      if (Object.keys(updates).length > 0) {
        const [updated] = await db
          .update(users)
          .set(updates)
          .where(eq(users.email, email))
          .returning();
        return NextResponse.json(updated);
      }
      // Return existing user (includes current credits balance)
      return NextResponse.json(existingUser);
    }

    // Insert new user with 3 free credits
    const [newUser] = await db
      .insert(users)
      .values({ name, email, pictureURL: pictureURL || "", credits: 3 })
      .returning();

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[POST /api/user] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
