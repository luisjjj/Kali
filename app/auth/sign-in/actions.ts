"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("That email looks off."),
  password: z.string().min(1, "Enter your password."),
});

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const { error } = await auth.signIn.email({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message || "Could not sign you in. Try again." };
  }

  redirect("/dashboard");
}
