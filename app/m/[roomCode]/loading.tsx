import { KaliWordmark } from "@/components/ui/brand";
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <KaliWordmark />
        <Skeleton className="h-9 w-32 !rounded-full" />
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-5 pb-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-video w-full !rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 w-full !rounded-xl" />
            <Skeleton className="h-11 w-full !rounded-xl" />
          </div>
        </div>
        <div className="kali-card h-fit p-7 sm:p-9">
          <Skeleton className="h-3 w-28 !rounded" />
          <Skeleton className="mt-3 h-9 w-3/4 !rounded-lg" />
          <Skeleton className="mt-2 h-4 w-32 !rounded" />
          <Skeleton className="mt-6 h-11 w-full !rounded-xl" />
          <Skeleton className="mt-4 h-12 w-full !rounded-full" />
        </div>
      </main>
    </div>
  );
}
