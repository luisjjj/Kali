import { KaliWordmark } from "@/components/ui/brand";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <KaliWordmark />
          <Skeleton className="h-9 w-24 !rounded-full" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-8 pb-16">
        <div className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 !rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20 !rounded" />
              <Skeleton className="h-8 w-64 max-w-full !rounded-lg" />
              <Skeleton className="h-4 w-52 max-w-full !rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-28 !rounded-full" />
            <Skeleton className="h-11 w-36 !rounded-full" />
          </div>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-32 !rounded" />
            <div className="kali-card overflow-hidden">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-b-0">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-44 max-w-full !rounded" />
                    <Skeleton className="h-3 w-64 max-w-full !rounded" />
                  </div>
                  <Skeleton className="h-9 w-32 !rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-56 w-full !rounded-[20px]" />
            <Skeleton className="h-32 w-full !rounded-[20px]" />
          </div>
        </div>
      </main>
    </div>
  );
}
