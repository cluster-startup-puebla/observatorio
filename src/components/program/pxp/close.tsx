import Link from "next/link";
import { companyAccountHref, ctaLabel, teamAccountHref } from "@/content/landing";

export function PxpClose() {
  return (
    <section id="registro" className="relative scroll-mt-24 overflow-hidden bg-program-field text-white">
      <p aria-hidden className="pointer-events-none absolute -right-6 bottom-0 font-display text-[12rem] leading-none font-extrabold text-white/10">
        x
      </p>
      <div className="relative mx-auto max-w-[1200px] px-4 py-24 text-center">
        <h2 className="pxp-title mx-auto max-w-[20ch] text-white md:max-w-[36ch] lg:max-w-[52ch]">
          Tu empresa declara sus necesidades tecnológicas y tú podrías obtener ventaja competitiva por ellas.
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href={companyAccountHref} className="btn w-full bg-white text-program-field sm:w-fit">
            {ctaLabel}
          </Link>
          <Link href={teamAccountHref} className="font-bold text-white underline underline-offset-4">
            Soy equipo de desarrollo →
          </Link>
        </div>
      </div>
    </section>
  );
}
