import { Skeleton } from "@/components/ui/skeleton";

const bar = "bg-ink/25";

function SessionShape() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4">
      <Skeleton className={`h-16 w-16 shrink-0 rounded-xl ${bar}`} />
      <span className="grid min-w-0 flex-1 gap-2">
        <Skeleton className={`h-5 w-full max-w-sm ${bar}`} />
        <Skeleton className={`h-4 w-full max-w-xs ${bar}`} />
      </span>
    </div>
  );
}

export default function SessionsLoading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <Skeleton className={`h-7 w-36 ${bar}`} />
      <section className="grid gap-3">
        <Skeleton className={`h-5 w-24 ${bar}`} />
        <SessionShape />
        <SessionShape />
        <SessionShape />
      </section>
      <section className="grid gap-3">
        <Skeleton className={`h-5 w-20 ${bar}`} />
        <SessionShape />
        <SessionShape />
      </section>
    </div>
  );
}
