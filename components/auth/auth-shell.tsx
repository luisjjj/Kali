import type { ReactNode } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Doodles } from "@/components/ui/doodles";

export function AuthShell({
  title,
  subtitle,
  asideTitle,
  asideBody,
  bullets,
  children,
}: {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideBody: string;
  bullets: string[];
  children: ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-screen overflow-x-clip">
      <ThemeToggle className="absolute top-5 right-5 z-20" />
      <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-line bg-[var(--surface-muted)] p-12 lg:flex">
        <div className="kali-canvas pointer-events-none absolute inset-0 opacity-60" />
        <Doodles variant="panel" />
        <KaliWordmark className="relative z-10" />
        <div className="relative z-10">
          <h2 className="display-tight max-w-md text-5xl leading-[1.03] font-semibold">
            {asideTitle}
            <span className="text-kali-accent">.</span>
          </h2>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-kali-muted">{asideBody}</p>
          <ul className="mt-8 flex flex-col gap-3 text-sm font-medium">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-kali-pink">
                  <Check className="h-3.5 w-3.5" weight="bold" />
                </span>
                {item}
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
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-kali-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
