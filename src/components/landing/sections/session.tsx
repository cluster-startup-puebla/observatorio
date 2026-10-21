import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { agenda, sessionFacts, speakers } from "@/content/landing";

export function Session() {
  return (
    <section id="sesion" data-testid="bloque-evento" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Un desayuno. Cuatro horas. Cero relleno." />
      <dl className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {sessionFacts.map((fact) => (
          <div key={fact.label} className="bg-surface p-6">
            <dt className="text-micro uppercase text-ink-muted">{fact.label}</dt>
            <dd className="text-body mt-2 text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12 max-w-3xl">
        <p className="text-micro uppercase text-ink-muted">Ponentes</p>
        <ul className="mt-4 grid gap-px bg-line sm:grid-cols-3">
          {speakers.map((speaker) => (
            <li key={speaker.id} className="flex items-center gap-4 bg-surface p-5">
              <img
                src={speaker.image}
                alt=""
                width={72}
                height={72}
                className="size-16 shrink-0 rounded-full border border-line bg-white object-cover"
              />
              <p className="text-h4 text-ink">{speaker.name}</p>
            </li>
          ))}
        </ul>
      </div>
      <ol className="mt-12 max-w-3xl border-t border-line">
        {agenda.map((item, index) => (
          <li key={item.name} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[9.5rem_1fr] sm:gap-8">
            <p className="text-small font-semibold text-ink">
              {String(index + 1).padStart(2, "0")} · {item.time}
            </p>
            <div>
              <h3 className="text-h4 text-ink">{item.name}</h3>
              <p className="text-small mt-2 text-ink-secondary">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
