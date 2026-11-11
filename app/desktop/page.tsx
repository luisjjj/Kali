import type { Metadata } from "next";
import { auth } from "@/lib/auth/server";
import { DesktopStart } from "@/components/desktop/desktop-start";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kali desktop",
  description: "Sign in to host a call or join with a code.",
};

export default async function DesktopPage() {
  const { data: session } = await auth.getSession();

  return (
    <DesktopStart
      user={session?.user ? { name: session.user.name ?? null } : null}
    />
  );
}
