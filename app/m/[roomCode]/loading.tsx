import { KaliWordmark } from "@/components/ui/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MeetingLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-kali-paper dark:bg-kali-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <Badge tone="pink">···</Badge>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-5 pb-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-video w-full !rounded-[24px]" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-12 w-full !rounded-2xl" />
            <Skeleton className="h-12 w-full !rounded-2xl" />
          </div>
        </div>
        <div className="rounded-[28px] bg-kali-pink p-8 sm:p-10">
          <Skeleton className="h-4 w-32 !rounded-full bg-kali-ink/10" />
          <Skeleton className="mt-3 h-10 w-3/4 !rounded-2xl bg-kali-ink/10" />
          <Skeleton className="mt-6 h-13 w-full !rounded-2xl bg-white/70" />
          <Skeleton className="mt-4 h-14 w-full !rounded-full bg-kali-ink/80" />
        </div>
      </main>
    </div>
  );
}
