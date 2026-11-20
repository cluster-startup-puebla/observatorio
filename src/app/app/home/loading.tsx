import { Skeleton } from "@/components/ui/skeleton";

const bar = "bg-ink/25";

function HeaderShape() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Skeleton className={`h-6 w-36 ${bar}`} />
      <span className="flex items-center gap-2">
        <Skeleton className={`h-8 w-24 rounded-full ${bar}`} />
        <Skeleton className={`size-10 rounded-full ${bar}`} />
      </span>
    </div>
  );
}

function GreetingShape() {
  return (
    <div className="grid gap-2">
      <Skeleton className={`h-4 w-28 ${bar}`} />
      <Skeleton className={`h-9 w-48 ${bar}`} />
      <Skeleton className={`h-4 w-64 max-w-full ${bar}`} />
    </div>
  );
}

function CardShape() {
  return (
    <div className="rounded-[2rem] border border-line bg-elevated px-6 py-8 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]">
      <Skeleton className={`h-6 w-full max-w-xl ${bar}`} />
      <Skeleton className={`mt-3 h-6 w-full max-w-md ${bar}`} />
      <Skeleton className={`mt-6 h-11 w-full rounded-full sm:w-80 ${bar}`} />
    </div>
  );
}

function FeedShape() {
  return (
    <section className="grid gap-4 border-t border-line pt-6">
      <Skeleton className={`h-7 w-16 ${bar}`} />
      <div className="flex flex-col items-center md:rounded-[2rem] md:border md:border-line md:bg-elevated md:px-6 md:py-8 md:shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]">
        <Skeleton className={`h-7 w-32 rounded-full ${bar}`} />
        <Skeleton className={`mt-6 size-12 rounded-full ${bar}`} />
        <Skeleton className={`mt-4 h-8 w-40 ${bar}`} />
        <Skeleton className={`mt-3 h-5 w-72 max-w-full ${bar}`} />
      </div>
    </section>
  );
}

export default function HomeLoading() {
  return (
    <div className="grid w-full max-w-lg gap-6 md:max-w-none" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <header className="grid gap-4">
        <HeaderShape />
        <GreetingShape />
      </header>
      <CardShape />
      <FeedShape />
    </div>
  );
}
