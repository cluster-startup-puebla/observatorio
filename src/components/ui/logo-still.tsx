import Image from "next/image";
import { opticalLogoHeight } from "@/components/landing/atoms/partner-mark";
import type { CarouselLogo } from "@/components/ui/logo-sets";

export function LogoStill({ logos, named = false }: { logos: CarouselLogo[]; named?: boolean }) {
  const columns = named
    ? "grid grid-cols-2 gap-x-6 gap-y-8"
    : "grid grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6";

  return (
    <ul className={columns}>
      {logos.map((logo) => (
        <li key={logo.src} className={named ? "flex flex-col items-center gap-2 text-center" : "grid h-16 place-items-center"}>
          <Image
            src={logo.src}
            alt={named ? "" : logo.name}
            width={logo.width}
            height={logo.height}
            className="logo-negative w-auto max-w-full object-contain"
            style={{ height: opticalLogoHeight(logo.width, logo.height, named ? 56 : 40) }}
          />
          {named ? <p className="text-small text-ink">{logo.name}</p> : null}
        </li>
      ))}
    </ul>
  );
}
