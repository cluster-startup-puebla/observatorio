import { Check, Clock3, Mail, QrCode } from "lucide-react";

const steps = [
  { key: "done", label: "Solicitud enviada", detail: "Pediste acceso a esta sesión." },
  { key: "current", label: "Revisión en lista", detail: "El organizador confirma tu acceso." },
  { key: "next", label: "Pase y QR", detail: "Llegan por correo y aquí en la app." },
] as const;

const markClass = {
  done: "grid size-7 place-items-center rounded-full bg-navy text-white",
  current: "grid size-7 place-items-center rounded-full bg-brand text-white",
  next: "grid size-7 place-items-center rounded-full border border-line bg-surface text-ink-secondary",
} as const;

/** Waiting state after claim, before CRM/lista acceptance unlocks the pass. */
export function SessionPassWaiting() {
  return (
    <section
      className="rounded-2xl border border-line bg-elevated px-5 py-5"
      data-testid="pase-en-espera"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-2.5 py-0.5 text-small font-semibold text-brand">
            <Clock3 className="size-3.5" aria-hidden />
            En espera
          </span>
          <h2 className="font-display text-h3 text-ink">Pendiente de aceptación</h2>
          <p className="text-body text-ink-secondary">
            Cuando te acepten en la lista, te enviamos el pase por correo y aquí aparece el QR.
          </p>
        </div>
        <ol className="grid gap-2">
          {steps.map((step) => (
            <li
              key={step.label}
              className={
                step.key === "current"
                  ? "grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-brand/25 bg-surface px-3 py-2.5"
                  : "grid grid-cols-[auto_1fr] items-start gap-3 px-3 py-1.5"
              }
            >
              <span className={markClass[step.key]}>
                {step.key === "done" ? <Check className="size-3.5" aria-hidden /> : null}
                {step.key === "current" ? <Mail className="size-3.5" aria-hidden /> : null}
                {step.key === "next" ? <QrCode className="size-3.5" aria-hidden /> : null}
              </span>
              <div className="min-w-0">
                <p className="text-body font-semibold text-ink">{step.label}</p>
                <p className="text-small text-ink-secondary">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-small text-ink-secondary">Si el correo no aparece, revisa spam.</p>
      </div>
    </section>
  );
}
