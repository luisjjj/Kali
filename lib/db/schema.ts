import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const meetings = pgTable("meetings", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostUserId: text("host_user_id").notNull(),
  title: text("title").notNull(),
  roomCode: text("room_code").notNull().unique(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  meetingId: uuid("meeting_id")
    .notNull()
    .unique()
    .references(() => meetings.id, { onDelete: "cascade" }),
  livekitRoomName: text("livekit_room_name").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }),
  endReason: text("end_reason"),
  peakParticipants: integer("peak_participants").notNull().default(0),
  minutesByParticipant: jsonb("minutes_by_participant")
    .$type<Record<string, number>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
    identity: text("identity"),
    userId: text("user_id"),
    displayName: text("display_name").notNull(),
    role: text("role").notNull().default("guest"),
    networkSummary: jsonb("network_summary").$type<Record<string, unknown>>(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (t) => [
    index("participants_meeting_id_idx").on(t.meetingId),
    uniqueIndex("participants_meeting_id_identity_unique").on(t.meetingId, t.identity),
    index("participants_session_id_idx").on(t.sessionId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    senderName: text("sender_name").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("messages_meeting_id_idx").on(t.meetingId)]
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
    kind: text("kind").notNull(),
    quantity: numeric("quantity").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
  },
  (t) => [
    index("usage_events_owner_user_id_idx").on(t.ownerUserId),
    index("usage_events_session_id_idx").on(t.sessionId),
  ]
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull().unique(),
    payload: jsonb("payload").$type<unknown>().notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (t) => [index("webhook_events_received_at_idx").on(t.receivedAt)]
);

export const plans = pgTable("plans", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  priceNaira: integer("price_naira").notNull().default(0),
  priceUsd: integer("price_usd").notNull().default(0),
  limits: jsonb("limits").$type<Record<string, unknown>>().notNull().default({}),
  active: boolean("active").notNull().default(false),
});

export const entitlements = pgTable(
  "entitlements",
  {
    ownerUserId: text("owner_user_id").notNull(),
    key: text("key").notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    source: text("source").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.ownerUserId, t.key] })]
);

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type CallSession = typeof sessions.$inferSelect;
export type NewCallSession = typeof sessions.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type ChatMessage = typeof messages.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
