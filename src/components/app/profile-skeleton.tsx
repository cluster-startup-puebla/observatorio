import { Skeleton } from "@/components/ui/skeleton";

function SoonButton({ label }: { label: string }) {
  return (
    <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink/10 px-4 py-2 text-base font-semibold text-transparent md:w-[300px]">
      {label}
      <span className="badge-brand normal-case text-transparent">Próximamente</span>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="grid w-full max-w-lg gap-4 md:max-w-none" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <article className="overflow-hidden md:card">
        <Skeleton className="h-52 rounded-none bg-ink/10 md:h-72" />
        <div className="pb-2 md:px-8 md:pb-8">
          <div className="relative z-20 -mt-14 flex flex-col gap-4 sm:flex-row sm:items-start">
            <Skeleton className="size-28 shrink-0 rounded-full bg-ink/10" />
            <div className="min-w-0 pb-1 sm:mt-16">
              <Skeleton className="h-[2.3rem] w-72 max-w-full bg-ink/10" />
              <Skeleton className="mt-1 h-[1.8rem] w-48 max-w-full bg-ink/10" />
            </div>
          </div>
          <div className="mt-8 grid gap-4">
            <div>
              <Skeleton className="h-[1.225rem] w-20 bg-ink/10" />
              <Skeleton className="mt-1 h-[1.8rem] w-36 bg-ink/10" />
            </div>
            <div>
              <Skeleton className="h-[1.225rem] w-16 bg-ink/10" />
              <Skeleton className="mt-1 h-[1.8rem] w-64 max-w-full bg-ink/10" />
            </div>
          </div>
          <section className="mt-10 border-t border-line pt-8">
            <Skeleton className="h-[1.4625rem] w-24 bg-ink/10" />
            <div className="mt-5 flex items-center gap-4">
              <Skeleton className="size-14 shrink-0 rounded-full bg-ink/10" />
              <Skeleton className="h-[1.8rem] w-32 bg-ink/10" />
            </div>
          </section>
        </div>
      </article>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        <div className="btn w-full animate-pulse bg-ink/10 text-transparent md:w-[300px]">
          Cerrar sesión
        </div>
        <SoonButton label="Editar perfil" />
        <SoonButton label="Borrar cuenta" />
      </div>
    </div>
  );
}
