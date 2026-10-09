import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Allow build without DB; route handlers check at runtime.
  console.warn("[db] DATABASE_URL is not set. Db calls will fail at runtime.");
}

const sql = neon(databaseUrl ?? "postgresql://localhost:5432/kali");

export const db = drizzle(sql, { schema });
