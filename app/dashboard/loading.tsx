import { KaliWordmark } from "@/components/ui/brand";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-kali-paper dark:bg-kali-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <Skeleton className="h-10 w-24 !rounded-full" />
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-16">
        <div className="rounded-[32px] bg-kali-ink p-6 sm:p-10">
          <Skeleton className="h-12 w-12 !rounded-full" />
          <Skeleton className="mt-4 h-9 w-2/3 !rounded-2xl bg-white/10" />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-3xl bg-white/10 p-5">
                <Skeleton className="h-9 w-9 !rounded-full bg-white/10" />
                <Skeleton className="mt-4 h-12 w-full !rounded-2xl bg-white/10" />
                <Skeleton className="mt-3 h-12 w-full !rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-7 w-40 !rounded-full" />
              <Skeleton className="h-24 w-full !rounded-[20px]" />
              <Skeleton className="h-24 w-full !rounded-[20px]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
