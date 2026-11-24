import Image from "next/image";
import { disruptorsMission } from "@/content/disruptors";
import { disruptorsSpeakers } from "@/content/disruptors-speakers";

export function DisruptorsSpeakers() {
  return (
    <section id="ponentes" className="scroll-mt-24 border-t border-line bg-surface-subtle py-16 lg:py-20">
      <div className="container-site">
        <header className="max-w-2xl">
          <span className="block h-1 w-12 bg-brand" aria-hidden />
          <h2 className="text-h2 mt-4 text-ink">Los expertos</h2>
          <p className="mt-3 text-body text-ink-secondary">{disruptorsMission}</p>
        </header>
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {disruptorsSpeakers.map((speaker) => (
            <li key={speaker.number} className="flex flex-col items-center text-center">
              <div className="w-full overflow-hidden bg-navy">
                <Image
                  src={speaker.photo}
                  alt={speaker.name}
                  width={800}
                  height={1200}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="aspect-[2/3] w-full object-cover object-top"
                />
              </div>
              <p className="mt-4 text-micro font-semibold tracking-[0.16em] text-brand uppercase">
                {speaker.number}
              </p>
              <h3 className="text-h4 mt-2 text-balance text-ink">{speaker.name}</h3>
              <p className="text-small mt-2 text-balance text-ink-secondary">{speaker.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
