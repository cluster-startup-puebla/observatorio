import { opticalLogoHeight, ThemedLogo } from "@/components/landing/atoms/partner-mark";

const institutional = [
  {
    src: "/logos/logo-estado.svg",
    alt: "Gobierno del Estado de Puebla",
    width: 301,
    height: 126,
  },
  {
    src: "/logos/logo-sedetra.png",
    alt: "Secretaría de Desarrollo Económico y Trabajo",
    width: 1106,
    height: 253,
  },
  {
    src: "/logos/logo-secihti.png",
    alt: "Secretaría de Ciencia, Humanidades, Tecnología e Innovación",
    width: 501,
    height: 274,
  },
  {
    src: "/logos/logo-por-amor-a-puebla.svg",
    alt: "Por amor a Puebla",
    width: 1470,
    height: 590,
  },
  {
    src: "/logos/logo-transformar-en-grande.png",
    alt: "Transformar en Grande",
    width: 806,
    height: 251,
  },
];

function markScale(src: string) {
  if (src.includes("por-amor") || src.includes("transformar")) return 0.6;
  return 1;
}

export function GovernmentLockup({ optical = false }: { optical?: boolean }) {
  const target = optical ? 44 : 36;
  return (
    <ul className="flex w-full min-w-0 flex-nowrap items-center justify-center [--gov:0.56] min-[23rem]:[--gov:0.68] sm:[--gov:1]">
      {institutional.map((logo, index) => (
        <li key={logo.src} className="flex shrink-0 items-center">
          <ThemedLogo
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="w-auto object-contain"
            style={{ height: `calc(${logoHeight(logo, target)}px * var(--gov))` }}
          />
          <Bar index={index} />
        </li>
      ))}
    </ul>
  );
}

function logoHeight(logo: (typeof institutional)[number], target: number) {
  return Math.round(opticalLogoHeight(logo.width, logo.height, target) * markScale(logo.src));
}

function Bar({ index }: { index: number }) {
  if (index >= institutional.length - 1) return null;
  return <span aria-hidden className="px-1 leading-none text-ink-muted sm:px-2.5">|</span>;
}
