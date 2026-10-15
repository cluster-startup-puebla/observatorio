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
    src: "/logos/logo-cinco-de-mayo.png",
    alt: "5 de Mayo",
    width: 333,
    height: 252,
  },
];

export function GovernmentLockup({ optical = false }: { optical?: boolean }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-x-5 gap-y-4">
      {institutional.map((logo) => (
        <ThemedLogo
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className={optical ? "h-auto w-auto object-contain" : "h-10 w-auto sm:h-12"}
          style={optical ? { height: opticalLogoHeight(logo.width, logo.height) } : undefined}
        />
      ))}
    </div>
  );
}
