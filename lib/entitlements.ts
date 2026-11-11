import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "./db/client";
import { entitlements } from "./db/schema";
import {
  resolveEntitlementsFromRows,
  type ResolvedEntitlements,
} from "./entitlements-core";

export type { ResolvedEntitlements } from "./entitlements-core";
export { FREE_ENTITLEMENTS, resolveEntitlementsFromRows } from "./entitlements-core";

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { value: ResolvedEntitlements; expiresAt: number }>();

export async function resolveEntitlements(
  ownerUserId: string
): Promise<ResolvedEntitlements> {
  const cached = cache.get(ownerUserId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const now = new Date();
  const rows = await db
    .select({
      key: entitlements.key,
      value: entitlements.value,
      expiresAt: entitlements.expiresAt,
    })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.ownerUserId, ownerUserId),
        or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, now))
      )
    );

  const value = resolveEntitlementsFromRows(rows, now);
  cache.set(ownerUserId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}
