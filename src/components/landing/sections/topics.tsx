import { SectionHeading } from "@/components/landing/molecules/section-heading";

const topics = [
  "Infraestructura y digitalización",
  "Situación del equipo productivo",
  "Gestión financiera y costos",
  "Operación, paros y calidad",
];

export function Topics() {
  return (
    <section data-testid="bloque-temas" className="scroll-mt-24 border-b border-line">
      <div className="container-site py-20 lg:py-28">
        <SectionHeading kicker="Temas" title="Lo que se levanta en la sesión." />
        <ul className="mt-12 grid gap-px bg-line sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic} className="bg-surface p-6 text-h4 text-ink">
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
