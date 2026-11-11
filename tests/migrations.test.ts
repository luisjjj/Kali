import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migrationsDir = join(process.cwd(), "drizzle");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();
const baselineFile = migrationFiles.find(
  (file) => file.startsWith("0000_baseline") && file.endsWith(".sql")
);
const laterFiles = migrationFiles.filter((file) => file !== baselineFile);

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

test("migrations create the phase 1 lean schema", async () => {
  assert.ok(baselineFile, "drizzle/0000_baseline.sql must exist");

  const db = new PGlite();
  await db.waitReady;

  try {
    // The baseline must be safe against a database that already has the
    // original meeting tables. Run it twice before applying later migrations.
    await runMigration(db, baselineFile);
    await runMigration(db, baselineFile);

    for (const file of laterFiles) {
      await runMigration(db, file);
    }

    const tables = await db.query<{ table_name: string }>(
      `select table_name
       from information_schema.tables
       where table_schema = 'public'
         and table_name in (
           'meetings', 'participants', 'messages', 'sessions',
           'usage_events', 'webhook_events', 'plans', 'entitlements'
         )
       order by table_name`
    );
    assert.deepEqual(
      tables.rows.map((row) => row.table_name),
      [
        "entitlements",
        "meetings",
        "messages",
        "participants",
        "plans",
        "sessions",
        "usage_events",
        "webhook_events",
      ]
    );

    const participantColumns = await db.query<{ column_name: string }>(
      `select column_name
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'participants'
         and column_name in ('identity', 'network_summary', 'role', 'session_id')
       order by column_name`
    );
    assert.deepEqual(
      participantColumns.rows.map((row) => row.column_name),
      ["identity", "network_summary", "role", "session_id"]
    );

    const indexes = await db.query<{ indexname: string }>(
      `select indexname
       from pg_indexes
       where schemaname = 'public'
         and indexname in (
           'meetings_room_code_unique',
           'participants_meeting_id_idx',
           'participants_meeting_id_identity_unique',
           'participants_session_id_idx',
           'messages_meeting_id_idx',
           'sessions_meeting_id_unique',
           'usage_events_owner_user_id_idx',
           'usage_events_session_id_idx',
           'webhook_events_received_at_idx'
         )
       order by indexname`
    );
    assert.deepEqual(
      indexes.rows.map((row) => row.indexname),
      [
        "meetings_room_code_unique",
        "messages_meeting_id_idx",
        "participants_meeting_id_identity_unique",
        "participants_meeting_id_idx",
        "participants_session_id_idx",
        "sessions_meeting_id_unique",
        "usage_events_owner_user_id_idx",
        "usage_events_session_id_idx",
        "webhook_events_received_at_idx",
      ]
    );

    const constraints = await db.query<{ conname: string }>(
      `select conname
       from pg_constraint
       where conname in (
         'participants_meeting_id_meetings_id_fk',
         'messages_meeting_id_meetings_id_fk',
         'sessions_meeting_id_meetings_id_fk',
         'usage_events_session_id_sessions_id_fk',
         'participants_session_id_sessions_id_fk',
         'entitlements_owner_user_id_key_pk'
       )
       order by conname`
    );
    assert.deepEqual(
      constraints.rows.map((row) => row.conname),
      [
        "entitlements_owner_user_id_key_pk",
        "messages_meeting_id_meetings_id_fk",
        "participants_meeting_id_meetings_id_fk",
        "participants_session_id_sessions_id_fk",
        "sessions_meeting_id_meetings_id_fk",
        "usage_events_session_id_sessions_id_fk",
      ]
    );
  } finally {
    await db.close();
  }
});
