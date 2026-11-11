import Link from "next/link";
import { KaliWordmark } from "@/components/ui/brand";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Doodles } from "@/components/ui/doodles";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="relative isolate flex min-h-screen overflow-hidden">
      <ThemeToggle className="absolute top-5 right-5 z-20" />
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-kali-pink p-10 lg:flex">
        <Doodles always className="z-0 opacity-80" />
        <KaliWordmark tone="ink" className="relative z-10" />
        <div className="relative z-10">
          <h2 className="text-5xl font-bold tracking-tight text-kali-ink">
            Welcome back, cutie.
          </h2>
          <p className="mt-3 max-w-md text-lg font-medium text-kali-ink/75">
            Your rooms missed you. Hop back in. It takes one tap.
          </p>
        </div>
        <p className="relative z-10 font-bold text-kali-ink/75">kali. Start a call, no fuss.</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <Card className="w-full max-w-md shadow-none">
          <div className="lg:hidden">
            <KaliWordmark />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1 text-kali-ink/65 dark:text-kali-paper/65">Good to see you again.</p>
          <div className="mt-6">
            <SignInForm />
          </div>
          <p className="mt-4 text-sm font-semibold text-kali-ink/65 dark:text-kali-paper/65">
            New here?{" "}
            <Link href="/auth/sign-up" className="font-bold text-kali-ink underline dark:text-kali-paper">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
