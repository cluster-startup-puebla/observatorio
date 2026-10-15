import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { Tile } from "@/components/landing/molecules/tile";
import { benefits } from "@/content/landing";

export function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-24 border-t border-line bg-surface-subtle py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading title="Qué ganas tú, concretamente." />
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Tile key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
