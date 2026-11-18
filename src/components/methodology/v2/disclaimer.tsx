import { BookLock, EyeOff, Lock, Shield, type LucideIcon } from "lucide-react";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { acceptDisclaimer } from "@/app/metodologia/accept-disclaimer";

const points: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Lock,
    title: "Solo uso estadístico",
    body: "Sirve para el diagnóstico del día.",
  },
  {
    icon: EyeOff,
    title: "Sin el nombre de tu empresa",
    body: "No se publica ni se entrega a otros asistentes.",
  },
  {
    icon: Shield,
    title: "Tus respuestas no se identifican",
    body: "Los resultados del día no dicen quién contestó.",
  },
];

export function Disclaimer() {
  return (
    <section
      data-testid="metodologia-aviso"
      className="mx-auto w-full max-w-sm rounded-[2rem] border border-line bg-elevated px-6 pt-8 pb-6 shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]"
    >
      <div className="relative mx-auto grid size-28 place-items-center">
        <span aria-hidden className="absolute size-20 rounded-full bg-brand/40 blur-xl" />
        <BookLock aria-hidden className="relative size-14 text-ink" strokeWidth={1.75} />
      </div>
      <h1 className="mt-4 text-center text-h3 text-balance text-ink">Esta información es privada</h1>
      <ul className="mt-8 grid gap-5">
        {points.map((point) => (
          <li key={point.title} className="flex gap-3">
            <point.icon aria-hidden className="mt-0.5 size-6 shrink-0 text-ink" strokeWidth={1.75} />
            <span>
              <span className="block font-semibold text-ink">{point.title}</span>
              <span className="mt-0.5 block text-small leading-snug text-ink-secondary">{point.body}</span>
            </span>
          </li>
        ))}
      </ul>
      <form action={acceptDisclaimer} className="mt-8">
        <PendingSubmit idle="Entiendo y empiezo" pendingLabel="Empezando…" className="btn btn-primary w-full" />
      </form>
    </section>
  );
}
