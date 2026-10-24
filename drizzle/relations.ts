import { relations } from "drizzle-orm/relations";
import { users, videoData } from "./schema";

export const videoDataRelations = relations(videoData, ({one}) => ({
	user: one(users, {
		fields: [videoData.uid],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	videoData: many(videoData),
}));