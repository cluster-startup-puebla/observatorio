import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

const cards = [
  { href: "/sesiones", title: "Sesiones", text: "Calendario y próximos encuentros" },
  {
    href: "/blog/arranque-puebla-x-puebla-2026",
    title: "Bitácora: Arranque Puebla x Puebla",
    text: "Lo que dejó el encuentro inaugural",
  },
];

export function PxpFollow() {
  return (
    <PxpFrame id="sesiones">
      <PxpHeading eyebrow="Dónde sigue" title="El trabajo continúa en las sesiones" />
      <p className="mt-6 max-w-[52ch] text-body text-ink">
        Cada sesión reúne a empresas y equipos alrededor de las necesidades declaradas. La bitácora publica lo que cada encuentro deja.
      </p>
      <ul className="mt-10 grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="flex h-full items-center justify-between gap-4 border border-line p-6 hover:border-program-field">
              <span>
                <span className="block text-h3 text-ink">{card.title}</span>
                <span className="mt-2 block text-body text-ink-secondary">{card.text}</span>
              </span>
              <ArrowRight aria-hidden className="shrink-0 text-program-field" />
            </Link>
          </li>
        ))}
      </ul>
    </PxpFrame>
  );
}
