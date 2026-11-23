"use client";

import { useActionState } from "react";
import Link from "next/link";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { requestPasswordReset } from "@/app/auth/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  if (state?.sent) {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
          <EnvelopeSimple className="h-6 w-6" weight="duotone" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-kali-muted">
            If that address has a Kali account, a reset link is on its way. It expires in an hour.
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          placeholder="you@cute.dev"
          autoComplete="email"
          required
        />
      </Field>
      {state?.error && (
        <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-kali-muted">
        Remembered it?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
