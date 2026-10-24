import { pgTable, unique, uuid, varchar, text, integer, timestamp, foreignKey, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	pictureUrl: text("picture_url").notNull(),
	credits: integer().default(3).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const videoData = pgTable("video_data", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	topic: text().notNull(),
	script: text().notNull(),
	videoStyle: varchar("video_style", { length: 100 }).notNull(),
	voice: varchar({ length: 100 }).notNull(),
	caption: jsonb(),
	images: jsonb(),
	audioUrl: text("audio_url"),
	captionJson: jsonb("caption_json"),
	downloadUrl: text("download_url"),
	status: varchar({ length: 50 }).default('pending').notNull(),
	errorMessage: text("error_message"),
	uid: uuid().notNull(),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.uid],
			foreignColumns: [users.id],
			name: "video_data_uid_users_id_fk"
		}).onDelete("cascade"),
]);
