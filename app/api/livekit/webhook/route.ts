import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { WebhookReceiver, type WebhookEvent } from "livekit-server-sdk";
import { db } from "@/lib/db/client";
import { webhookEvents } from "@/lib/db/schema";
import { livekitEnv } from "@/lib/livekit";
import { processLiveKitEvent } from "@/lib/livekit-webhook-processor";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;

export async function POST(req: Request) {
  const rawAuthHeader =
    req.headers.get("authorization") ?? req.headers.get("authorize");
  if (!rawAuthHeader) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 401 });
  }

  const authHeader = rawAuthHeader.startsWith("Bearer ")
    ? rawAuthHeader.slice("Bearer ".length)
    : rawAuthHeader;

  const body = await req.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook body is too large." }, { status: 413 });
  }

  let env: ReturnType<typeof livekitEnv>;
  try {
    env = livekitEnv();
  } catch {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 503 });
  }

  let event: WebhookEvent;
  try {
    event = await new WebhookReceiver(env.apiKey, env.apiSecret).receive(body, authHeader);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  if (!event.id || !event.event) {
    return NextResponse.json({ error: "Webhook event is missing an id or type." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const [inserted] = await db
    .insert(webhookEvents)
    .values({ provider: "livekit", eventId: event.id, payload })
    .onConflictDoNothing({ target: webhookEvents.eventId })
    .returning({ id: webhookEvents.id });

  if (!inserted) {
    const [existing] = await db
      .select({ processedAt: webhookEvents.processedAt })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, event.id));

    if (existing?.processedAt) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  try {
    await processLiveKitEvent(db, event);
    await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.eventId, event.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[livekit-webhook] failed to process event", event.event, event.id, err);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
