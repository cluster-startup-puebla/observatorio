import { AppCard } from "@/components/app/app-card";
import { Skeleton } from "@/components/ui/skeleton";

const block = "bg-ink/10";

export function CompanySkeleton() {
  return (
    <div className="grid w-full min-w-0 max-w-lg gap-8 md:max-w-none" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <AppCard>
        <div className="flex items-center gap-4">
          <Skeleton className={`size-20 shrink-0 rounded-full ${block}`} />
          <div className="min-w-0 flex-1">
            <Skeleton className={`h-8 w-48 max-w-full ${block}`} />
            <Skeleton className={`mt-2 h-5 w-40 max-w-full ${block}`} />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className={`h-16 rounded-xl ${block}`} />
          <Skeleton className={`h-16 rounded-xl ${block}`} />
          <Skeleton className={`col-span-2 h-16 rounded-xl ${block}`} />
          <Skeleton className={`col-span-2 h-16 rounded-xl ${block}`} />
          <Skeleton className={`col-span-2 h-16 w-40 max-w-full justify-self-start rounded-xl ${block}`} />
        </div>
      </AppCard>
      <Skeleton className={`h-72 rounded-3xl ${block}`} />
      <div className="space-y-3">
        <Skeleton className={`h-4 w-16 ${block}`} />
        <Skeleton className={`h-5 w-40 ${block}`} />
        <Skeleton className={`h-48 rounded-2xl ${block}`} />
      </div>
    </div>
  );
}
