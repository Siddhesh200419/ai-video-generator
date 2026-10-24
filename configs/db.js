import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon serverless HTTP client — zero cold-start, works in Edge & Node runtimes
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
