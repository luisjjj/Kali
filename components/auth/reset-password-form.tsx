"use client";

import { useActionState } from "react";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react";
import { resetPassword } from "@/app/auth/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kali-danger/10 text-kali-danger">
          <WarningCircle className="h-6 w-6" weight="duotone" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">This link is missing its token</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-kali-muted">
            Reset links expire after an hour. Request a fresh one and try again.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <Field>
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="newPassword"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field>
        <Label htmlFor="reset-confirm">Confirm new password</Label>
        <Input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          placeholder="Same thing again"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      {state?.error && (
        <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={isPending}>
        {isPending ? "Saving..." : "Save new password"}
      </Button>
    </form>
  );
}
