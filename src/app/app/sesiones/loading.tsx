import { Skeleton } from "@/components/ui/skeleton";

const bar = "bg-ink/10";

function EmptyShape() {
  return (
    <div className="rounded-[2rem] border border-line bg-elevated px-6 py-8 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]">
      <div className="flex flex-col items-center">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="mt-4 h-7 w-52" />
      </div>
    </div>
  );
}

function SessionShape() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4">
      <Skeleton className="h-20 w-16 shrink-0 rounded-xl" />
      <span className="grid min-w-0 flex-1 gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </span>
    </div>
  );
}

export default function SessionsLoading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <Skeleton className={`h-9 w-40 ${bar}`} />
      <div className="grid gap-10">
        <section className="grid gap-4">
          <Skeleton className={`h-7 w-28 ${bar}`} />
          <EmptyShape />
        </section>
        <section className="grid gap-4">
          <Skeleton className={`h-7 w-24 ${bar}`} />
          <SessionShape />
        </section>
      </div>
    </div>
  );
}
