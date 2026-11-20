import Image from "next/image";
import type { PublicLogo } from "@/lib/program/public-logos";
import { PxpFrame } from "./frame";

export function PxpParticipants({ logos }: { logos: PublicLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <PxpFrame id="participantes" tone="sand">
      <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight font-extrabold text-ink">
        Empresas que ya declararon su necesidad
      </h2>
      <ul className="mt-10 grid grid-cols-3 gap-6 lg:grid-cols-6">
        {logos.map((logo) => (
          <li key={logo.src} className="grid h-24 place-items-center">
            <Image src={logo.src} alt={logo.name} width={160} height={80} className="max-h-16 w-auto object-contain" />
          </li>
        ))}
      </ul>
    </PxpFrame>
  );
}
