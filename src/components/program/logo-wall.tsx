import { ProgramSection } from "./program-section";

export function LogoWall({ logos }: { logos: { name: string; src: string }[] }) {
  if (logos.length === 0) return null;
  return (
    <ProgramSection title="Quién ya participa">
      <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
        {logos.map((logo) => (
          <li key={logo.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.name} className="h-12 w-auto max-w-40 object-contain" />
          </li>
        ))}
      </ul>
    </ProgramSection>
  );
}
