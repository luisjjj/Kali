import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PGlite } from "@electric-sql/pglite";

const migrationsDir = join(process.cwd(), "drizzle");

export const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

export const baselineFile = migrationFiles.find(
  (file) => file.startsWith("0000_baseline") && file.endsWith(".sql")
);

export async function runMigration(db: PGlite, file: string) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.exec(statement);
  }
}

export async function applyAllMigrations(db: PGlite) {
  if (!baselineFile) {
    throw new Error("drizzle/0000_baseline.sql must exist");
  }

  // The baseline must be safe against a database that already has the
  // original meeting tables. Run it twice before applying later migrations.
  await runMigration(db, baselineFile);
  await runMigration(db, baselineFile);

  for (const file of migrationFiles) {
    if (file !== baselineFile) {
      await runMigration(db, file);
    }
  }
}
