import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migrationsDir = join(process.cwd(), "drizzle");
const baselineFile = readdirSync(migrationsDir).find((file) => file.startsWith("0000_baseline") && file.endsWith(".sql"));

async function runMigration(db: PGlite, file: string) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.exec(statement);
  }
}

test("baseline migration creates the meeting tables and can be applied twice", async () => {
  assert.ok(baselineFile, "drizzle/0000_baseline.sql must exist");

  const db = new PGlite();
  await db.waitReady;

  try {
    await runMigration(db, baselineFile);
    await runMigration(db, baselineFile);

    const tables = await db.query<{ table_name: string }>(
      `select table_name
       from information_schema.tables
       where table_schema = 'public'
         and table_name in ('meetings', 'participants', 'messages')
       order by table_name`
    );
    assert.deepEqual(
      tables.rows.map((row) => row.table_name),
      ["meetings", "messages", "participants"]
    );

    const indexes = await db.query<{ indexname: string }>(
      `select indexname
       from pg_indexes
       where schemaname = 'public'
         and indexname in ('meetings_room_code_unique', 'participants_meeting_id_idx', 'messages_meeting_id_idx')
       order by indexname`
    );
    assert.deepEqual(
      indexes.rows.map((row) => row.indexname),
      ["meetings_room_code_unique", "messages_meeting_id_idx", "participants_meeting_id_idx"]
    );

    const foreignKeys = await db.query<{ conname: string }>(
      `select conname
       from pg_constraint
       where contype = 'f'
         and conname in ('participants_meeting_id_meetings_id_fk', 'messages_meeting_id_meetings_id_fk')
       order by conname`
    );
    assert.deepEqual(
      foreignKeys.rows.map((row) => row.conname),
      ["messages_meeting_id_meetings_id_fk", "participants_meeting_id_meetings_id_fk"]
    );
  } finally {
    await db.close();
  }
});
