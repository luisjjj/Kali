import Link from "next/link";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Doodles } from "@/components/ui/doodles";
import { JoinForm } from "@/components/join/join-form";

export default function JoinPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Doodles className="-z-10" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm" className="bg-white/60 hover:bg-white">
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16">
        <div className="rounded-[32px] bg-white p-8 shadow-xl shadow-kali-ink/10 sm:p-10">
          <p className="text-sm font-semibold tracking-widest text-kali-ink/70 uppercase">
            Join as a guest
          </p>
          <h1 className="display-tight mt-1 text-3xl font-semibold text-kali-ink sm:text-4xl">
            Got a code? You&apos;re in<span className="text-kali-pink">.</span>
          </h1>
          <p className="mt-2 text-kali-ink/65">
            No account needed. Just the code and whatever we should call you.
          </p>

          <div className="mt-6">
            <JoinForm />
          </div>

          <p className="mt-5 text-center text-sm font-semibold text-kali-ink/65">
            Want to host your own calls?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-kali-ink underline">
              Make a free account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
