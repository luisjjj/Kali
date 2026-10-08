"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(60),
  email: z.string().trim().email("That email looks off."),
  password: z.string().min(8, "Password needs at least 8 characters.").max(128),
});

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const { error } = await auth.signUp.email({
    email: parsed.data.email,
    name: parsed.data.name,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message || "Could not create your account. Try again." };
  }

  redirect("/dashboard");
}
