import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { isList, isNotList } from "@/content/landing";

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-surface p-6 lg:p-8">
      <h3 className="text-h4 text-ink">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="text-body text-ink-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Boundaries() {
  return (
    <section id="alcance" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Qué es, y qué no es, esto." />
      <div className="mt-12 grid gap-px bg-line lg:grid-cols-2">
        <Column title="Sí es" items={isList} />
        <Column title="No es" items={isNotList} />
      </div>
    </section>
  );
}
