import { disruptorsMoments } from "@/content/disruptors";

export function DisruptorsMoments() {
  return (
    <section id="experiencia" className="border-t border-line bg-surface-subtle py-16 lg:py-20">
      <div className="container-site">
        <header className="max-w-2xl">
          <span className="block h-1 w-12 bg-brand" aria-hidden />
          <h2 className="text-h2 mt-4 text-ink">¿Qué vas a vivir?</h2>
          <p className="mt-3 text-body text-ink-secondary">
            Un día. Grandes ideas. Conexiones que trascienden.
          </p>
        </header>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disruptorsMoments.map((moment) => (
            <li key={moment.title} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="text-h4 text-ink">{moment.title}</h3>
              <p className="mt-2 text-body text-ink-secondary">{moment.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
