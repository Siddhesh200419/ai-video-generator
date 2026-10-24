import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Users Table ──────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  pictureURL: text("picture_url").notNull(),
  credits: integer("credits").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// ─── Video Data Table ─────────────────────────────────────────────────────────
export const videoData = pgTable("video_data", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Content fields
  title: varchar("title", { length: 255 }).notNull(),
  topic: text("topic").notNull(),
  script: text("script").notNull(),
  videoStyle: varchar("video_style", { length: 100 }).notNull(),
  voice: varchar("voice", { length: 100 }).notNull(),
  caption: jsonb("caption"),

  // Generated assets (filled in by Inngest pipeline)
  images: jsonb("images"),            // string[] of image URLs
  audioUrl: text("audio_url"),
  captionJson: jsonb("caption_json"), // Deepgram word-level timestamps

  // Render output
  downloadUrl: text("download_url"),

  // Status tracking
  // 'pending' | 'generating' | 'completed' | 'failed'
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  errorMessage: text("error_message"), // populated when status = 'failed'

  // Relations & ownership
  uid: uuid("uid")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by", { length: 255 }).notNull(), // email

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
