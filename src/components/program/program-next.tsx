import Link from "next/link";
import { ProgramSection } from "./program-section";

export function ProgramNext() {
  return (
    <ProgramSection title="Dónde sigue">
      <p className="max-w-3xl text-body text-ink">
        El programa sigue en las sesiones. La bitácora publica lo que cada encuentro deja.
      </p>
      <ul className="mt-6 grid gap-3 text-body">
        <li>
          <Link href="/sesiones" className="text-link">
            Sesiones
          </Link>
        </li>
        <li>
          <Link href="/blog/arranque-puebla-x-puebla-2026" className="text-link">
            Arranque Puebla x Puebla
          </Link>
        </li>
      </ul>
    </ProgramSection>
  );
}
