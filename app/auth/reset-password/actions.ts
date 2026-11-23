"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";

const schema = z
  .object({
    token: z.string().trim().min(1, "This reset link is missing its token."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords don't match.",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const { error } = await auth.resetPassword({
    newPassword: parsed.data.newPassword,
    token: parsed.data.token,
  });

  if (error) {
    return {
      error: "That reset link is invalid or has expired. Request a fresh one and try again.",
    };
  }

  redirect("/auth/sign-in?reset=1");
}
