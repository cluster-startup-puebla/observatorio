import { SpeakerCard } from "@/components/landing/atoms/speaker-card";
import { speakers } from "@/content/speakers";

export function Speakers() {
  return (
    <section id="ponentes" data-testid="bloque-ponentes" className="scroll-mt-24 border-t border-line py-20 lg:py-28">
      <div className="container-site">
        <header className="max-w-3xl">
          <span className="block h-1 w-12 bg-brand" aria-hidden="true" />
          <h2 className="text-h2 mt-4 text-balance text-ink">Ponentes</h2>
          <p className="text-small mt-3 font-semibold text-link">Por confirmar</p>
        </header>
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => (
            <li key={speaker.photo}>
              <SpeakerCard speaker={speaker} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
