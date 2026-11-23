"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { appBaseUrl } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().email("That email looks off."),
});

export async function requestPasswordReset(
  _prevState: { sent?: boolean; error?: string } | null,
  formData: FormData
) {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "That email looks off." };
  }

  const { error } = await auth.requestPasswordReset({
    email: parsed.data.email,
    redirectTo: `${appBaseUrl()}/auth/reset-password`,
  });

  // Never reveal whether an address has an account: success is the same
  // response either way, service errors are only logged for ops.
  if (error) console.error("[auth] password reset request failed:", error);

  return { sent: true };
}
