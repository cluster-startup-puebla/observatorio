import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { sectors } from "@/lib/sectors";

export function Sectors() {
  return (
    <section className="scroll-mt-24 border-b border-line">
      <div className="container-site py-20 lg:py-28">
        <SectionHeading kicker="Sectores" title="La misma sesión. Elige el tuyo." />
        <ul className="mt-10 flex flex-wrap gap-3">
          {sectors.map((sector) => (
            <li key={sector.slug}>
              <a
                data-testid={`sector-${sector.slug}`}
                href={`/${sector.slug}`}
                className="btn btn-secondary px-4 py-2 text-small"
              >
                {sector.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
