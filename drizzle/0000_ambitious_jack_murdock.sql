-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"picture_url" text NOT NULL,
	"credits" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "video_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"topic" text NOT NULL,
	"script" text NOT NULL,
	"video_style" varchar(100) NOT NULL,
	"voice" varchar(100) NOT NULL,
	"caption" jsonb,
	"images" jsonb,
	"audio_url" text,
	"caption_json" jsonb,
	"download_url" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"uid" uuid NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_data" ADD CONSTRAINT "video_data_uid_users_id_fk" FOREIGN KEY ("uid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
*/