"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Label } from "@/components/ui/input";
import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <div className="flex min-h-screen bg-kali-paper dark:bg-kali-ink">
      <div className="hidden flex-1 flex-col justify-between bg-kali-pink p-10 lg:flex">
        <KaliWordmark />
        <div>
          <h2 className="text-5xl font-bold tracking-tight text-kali-ink">
            Come say hi. Stay for the call.
          </h2>
          <p className="mt-3 max-w-md text-lg font-medium text-kali-ink/75">
            Free rooms, friendly chat, zero downloads. You bring the gossip, we&apos;ll bring the
            pixels.
          </p>
        </div>
        <p className="font-bold text-kali-ink/60">kali. — start a call, no fuss.</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <Card className="w-full max-w-md shadow-none">
          <div className="lg:hidden">
            <KaliWordmark />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 font-medium text-kali-muted">Takes ten seconds, promise.</p>
          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Ada Lovelace" required />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@cute.dev" required />
            </Field>
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
              />
            </Field>
            {state?.error && (
              <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
                {state.error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" disabled={isPending}>
              {isPending ? "Making magic…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-sm font-semibold text-kali-muted">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-bold text-kali-ink underline dark:text-kali-paper">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
