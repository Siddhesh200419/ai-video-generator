import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    pictureURL: v.string(),
  },
  handler: async ({ db }, args) => {
    const user = await db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (!user[0]?.email) {
      const userData = {
        name: args.name,
        email: args.email,
        pictureURL: args.pictureURL,
        credits: 3,
      }
      //If not insert new user 
      const result = await db.insert("users", userData);

      return userData;
    }

    return user[0];
  },
});
