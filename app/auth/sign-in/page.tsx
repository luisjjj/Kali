import Link from "next/link";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Doodles } from "@/components/ui/doodles";

export default function SignInPage() {
  return (
    <div className="relative isolate flex min-h-screen overflow-x-clip">
      <ThemeToggle className="absolute top-5 right-5 z-20" />
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-line bg-[var(--surface-muted)] p-12 lg:flex">
        <div className="kali-canvas pointer-events-none absolute inset-0 opacity-60" />
        <Doodles variant="panel" />
        <KaliWordmark className="relative z-10" />
        <div className="relative z-10">
          <h2 className="display-tight max-w-md text-5xl leading-[1.03] font-semibold">
            Welcome back. Your rooms are waiting<span className="text-kali-pink">.</span>
          </h2>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-kali-muted">
            Pick up where you left off. One tap and the link is ready to share.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm font-medium">
            {["Your rooms and chats, saved", "Guest links ready to copy", "Full host controls"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
                    <Check className="h-3.5 w-3.5" weight="bold" />
                  </span>
                  {t}
                </li>
              )
            )}
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
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-kali-muted">Good to see you again.</p>
          <div className="mt-7">
            <SignInForm />
          </div>
          <p className="mt-5 text-sm text-kali-muted">
            New here?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-foreground underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
