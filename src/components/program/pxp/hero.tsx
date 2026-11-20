import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { ClusterMark } from "@/components/program/cluster-mark";
import { companyAccountHref, ctaLabel } from "@/content/landing";
import { HeroMark } from "./hero-mark";

const mark =
  "pointer-events-none aspect-square w-auto shrink-0 text-white lg:z-0 lg:h-[min(50svh,28rem)] lg:ml-auto max-lg:absolute max-lg:top-8 max-lg:-right-[16%] max-lg:z-20 max-lg:h-[26rem] max-lg:opacity-[0.34]";

export function PxpHero() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 items-center gap-8 px-4 py-6">
      <div className="relative z-10 w-full max-w-xl pl-6">
        <span aria-hidden className="absolute top-1.5 bottom-0 left-0 w-px bg-white/70" />
        <span aria-hidden className="absolute top-1.5 left-0 size-1.5 -translate-x-1/2 rounded-full bg-white" />
        <p className="pxp-kicker text-white">Levantamiento de necesidades tecnológicas</p>
        <h1 className="pxp-display mt-4">
          Puebla
          <br />
          <span className="text-program-x">x</span> Puebla
        </h1>
        <p className="pxp-copy mt-6 text-white">
          Dinos qué le falta a tu empresa en tecnología. Startups y equipos de desarrollo de Puebla construyen la solución, validada contigo.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <Link href={companyAccountHref} className="btn w-full bg-white text-center text-program-field sm:w-fit">
            {ctaLabel}
          </Link>
          <Link href="#como-funciona" className="inline-flex items-center gap-2 font-bold text-white">
            Ver cómo funciona
            <ArrowDown aria-hidden size={16} />
          </Link>
        </div>
        <p className="mt-5 flex items-center gap-3 text-small text-white/80">
          Una iniciativa de:
          <ClusterMark light className="h-14 w-auto" />
        </p>
        <div aria-hidden className="relative mt-5 h-2">
          <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/70" />
          <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
      </div>
      <HeroMark className={mark} />
    </div>
  );
}
