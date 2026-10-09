import Link from "next/link";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";

export function EndedScreen({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-kali-paper px-5 dark:bg-kali-ink">
      <KaliWordmark />
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-[28px] bg-kali-pink-pale/70 px-8 py-12 text-center">
        <div className="text-4xl">👋</div>
        <h1 className="text-2xl font-bold tracking-tight">This call has ended</h1>
        <p className="font-medium text-kali-ink/65 dark:text-kali-paper/65">
          “{title}” is all wrapped up. Thanks for hanging out!
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="md">
              Back to dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="md">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
