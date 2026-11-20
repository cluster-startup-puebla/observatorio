import { PxpAllies } from "./allies";
import { PxpHero } from "./hero";

export function PxpScreen() {
  return (
    <section
      id="inicio"
      data-program-field
      className="relative -mt-20 flex min-h-[calc(100svh+0.7rem)] flex-col overflow-hidden scroll-mt-24 bg-program-field pt-20 text-white"
    >
      <div id="hero-sentinel" className="pointer-events-none absolute top-24 h-px w-px" aria-hidden />
      <PxpHero />
      <PxpAllies />
    </section>
  );
}
