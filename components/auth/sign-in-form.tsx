"use client";

import { useActionState } from "react";
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
        <Label htmlFor={`${idPrefix}-password`}>Password</Label>
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
