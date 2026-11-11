DROP INDEX "video_data_uid_idx";--> statement-breakpoint
ALTER TABLE "video_data" ADD COLUMN "current_step" varchar(50) DEFAULT 'queued' NOT NULL;--> statement-breakpoint
ALTER TABLE "video_data" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "video_data_uid_created_at_idx" ON "video_data" USING btree ("uid","created_at");