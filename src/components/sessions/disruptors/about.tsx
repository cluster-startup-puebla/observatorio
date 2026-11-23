import { SessionFacts } from "@/components/landing/sections/session-facts";
import {
  disruptorsAboutBody,
  disruptorsAboutTitle,
  disruptorsDate,
  disruptorsFacts,
  disruptorsMission,
  disruptorsPlaceHref,
} from "@/content/disruptors";

export function DisruptorsAbout() {
  return (
    <section id="que-es" className="scroll-mt-24 border-t border-line py-16 lg:py-20">
      <div className="container-site">
        <span className="block h-1 w-12 bg-brand" aria-hidden />
        <h2 className="text-h2 mt-4 max-w-3xl text-balance text-ink">{disruptorsAboutTitle}</h2>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-secondary">{disruptorsAboutBody}</p>
        <p className="mt-6 max-w-2xl text-body font-medium text-ink">{disruptorsMission}</p>
        <p className="text-body mt-8 text-ink">
          <span className="text-micro mr-3 uppercase text-ink-muted">Fecha</span>
          {disruptorsDate}
        </p>
        <SessionFacts facts={disruptorsFacts} placeHref={disruptorsPlaceHref} />
      </div>
    </section>
  );
}
