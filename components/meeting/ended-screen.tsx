"use client";

import Link from "next/link";
import { HandWaving } from "@phosphor-icons/react";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { HomeLink } from "@/components/ui/home-link";
import { StartYourOwnCall } from "@/components/join/host-cta";
import { Doodles } from "@/components/ui/doodles";

export function EndedScreen({ title }: { title: string }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-clip px-5">
      <Doodles className="-z-10" />
      <KaliWordmark />
      <div className="kali-card flex w-full max-w-md flex-col items-center gap-3 px-8 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
          <HandWaving className="h-7 w-7" weight="duotone" />
        </span>
        <h1 className="display-tight text-2xl font-semibold tracking-tight">This call has ended</h1>
        <p className="text-sm leading-relaxed text-kali-muted">
          “{title}” is all wrapped up. Thanks for hanging out!
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <StartYourOwnCall variant="primary" size="md" />
          <Link href="/dashboard">
            <Button variant="ghost" size="md">
              Back to dashboard
            </Button>
          </Link>
          <HomeLink>
            <Button variant="ghost" size="md">
              Home
            </Button>
          </HomeLink>
        </div>
      </div>
    </div>
  );
}
