"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "@/app/auth/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";

export function SignInForm({ idPrefix = "signin" }: { idPrefix?: string }) {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          placeholder="you@cute.dev"
          required
        />
      </Field>
      <Field>
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={`${idPrefix}-password`} className="mb-0">
            Password
          </Label>
          <Link
            href="/auth/forgot-password"
            className="text-[13px] font-semibold text-kali-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          placeholder="Your password"
          required
        />
      </Field>
      {state?.error && (
        <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
