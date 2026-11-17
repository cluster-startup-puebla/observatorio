import { opticalLogoHeight, ThemedLogo } from "@/components/landing/atoms/partner-mark";

type Mark = { src: string; alt: string; width: number; height: number };

function mark(src: string, alt: string, width: number, height: number): Mark {
  return { src, alt, width, height };
}

const groups: Mark[][] = [
  [mark("/logos/logo-estado.svg", "Gobierno del Estado de Puebla", 301, 126)],
  [mark("/logos/logo-sedetra.png", "Secretaría de Desarrollo Económico y Trabajo", 1106, 253)],
  [mark("/logos/logo-secihti.png", "Secretaría de Ciencia, Humanidades, Tecnología e Innovación", 469, 242)],
  [mark("/logos/logo-por-amor-a-puebla.png", "Por amor a Puebla", 743, 274)],
  [mark("/logos/logo-transformar-en-grande.png", "Transformar en Grande", 773, 219)],
  [mark("/logos/logo-museos-puebla.png", "Museos Puebla", 478, 123)],
];

function markScale(src: string) {
  if (src.includes("por-amor") || src.includes("transformar")) return 0.6;
  return 1;
}

export function GovernmentLockup({ optical = false }: { optical?: boolean }) {
  const target = optical ? 44 : 36;
  return (
    <ul className="flex w-full min-w-0 flex-nowrap items-center justify-center [--gov:0.38] min-[23rem]:[--gov:0.52] sm:[--gov:0.61] md:[--gov:0.86]">
      {groups.map((group, index) => (
        <li key={group[0].src} className="flex shrink-0 items-center gap-1">
          {group.map((logo) => (
            <ThemedLogo
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="w-auto object-contain"
              style={{ height: `calc(${logoHeight(logo, target)}px * var(--gov))` }}
            />
          ))}
          <Bar index={index} />
        </li>
      ))}
    </ul>
  );
}

function logoHeight(logo: Mark, target: number) {
  return Math.round(opticalLogoHeight(logo.width, logo.height, target) * markScale(logo.src));
}

function Bar({ index }: { index: number }) {
  if (index >= groups.length - 1) return null;
  return <span aria-hidden className="px-1 leading-none text-ink-muted sm:px-2.5">|</span>;
}
