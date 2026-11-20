"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { opticalLogoHeight } from "@/components/landing/atoms/partner-mark";
import { LogoColumn } from "@/components/ui/logo-column";
import { logoColumns, type CarouselLogo } from "@/components/ui/logo-sets";

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LogoCarousel({ logos }: { logos: CarouselLogo[] }) {
  const reduce = useSyncExternalStore(subscribe, reducedMotion, () => false);
  if (logos.length === 0) return null;
  if (reduce) return <LogoStill logos={logos} />;

  const columns = logoColumns(logos, 6);
  return (
    <div>
      <ul className="sr-only">
        {logos.map((logo) => (
          <li key={logo.src}>{logo.name}</li>
        ))}
      </ul>
      <div aria-hidden className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {columns.map((column, index) => (
          <LogoColumn key={column[0].src} logos={column} index={index} />
        ))}
      </div>
    </div>
  );
}

function LogoStill({ logos }: { logos: CarouselLogo[] }) {
  return (
    <ul className="grid grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
      {logos.map((logo) => (
        <li key={logo.src} className="grid h-16 place-items-center">
          <ImageMark logo={logo} />
        </li>
      ))}
    </ul>
  );
}

function ImageMark({ logo }: { logo: CarouselLogo }) {
  return (
    <Image
      src={logo.src}
      alt={logo.name}
      width={logo.width}
      height={logo.height}
      className="logo-negative w-auto max-w-full object-contain"
      style={{ height: opticalLogoHeight(logo.width, logo.height, 40) }}
    />
  );
}
