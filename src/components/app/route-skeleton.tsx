import { Skeleton } from "@/components/ui/skeleton";

export function RouteSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid w-full max-w-lg gap-4 md:max-w-none" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: cards }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-[2rem]" />
      ))}
    </div>
  );
}

