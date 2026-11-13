"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <div className="relative isolate flex min-h-screen overflow-x-clip">
      <ThemeToggle className="absolute top-5 right-5 z-20" />
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-line bg-[var(--surface-muted)] p-12 lg:flex">
        <div className="kali-canvas pointer-events-none absolute inset-0 opacity-60" />
        <KaliWordmark className="relative z-10" />
        <div className="relative z-10">
          <h2 className="display-tight max-w-md text-5xl leading-[1.03] font-semibold">
            Come say hi. Stay for the call<span className="text-kali-pink">.</span>
          </h2>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-kali-muted">
            Free rooms, friendly chat, zero downloads. You bring the conversation, we&apos;ll bring
            the pixels.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm font-medium">
            {["Rooms in seconds", "Guests join with a link", "Free while we're little"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
                  <Check className="h-3.5 w-3.5" weight="bold" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-sm text-kali-muted">kali. Start a call, no fuss.</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <KaliWordmark />
          </div>
          <h1 className="display-tight mt-6 text-3xl font-semibold tracking-tight lg:mt-0">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-kali-muted">Takes ten seconds, promise.</p>
          <form action={formAction} className="mt-7 flex flex-col gap-4">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Ada Lovelace" autoComplete="name" required />
            </Field>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </Field>
            {state?.error && (
              <p role="alert" className="rounded-xl bg-kali-danger/10 px-4 py-3 text-sm font-semibold text-kali-danger">
                {state.error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-kali-muted">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-semibold text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
