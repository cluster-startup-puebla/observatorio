import Link from "next/link";
import { companyAccountHref, teamAccountHref } from "@/content/landing";

export function PxpClose() {
  return (
    <section id="registro" className="relative scroll-mt-24 overflow-hidden bg-program-field text-white">
      <p aria-hidden className="pointer-events-none absolute -right-6 bottom-0 font-serif text-[12rem] leading-none text-white/10">
        x
      </p>
      <div className="relative mx-auto max-w-[1200px] px-4 py-24 text-center">
        <h2 className="mx-auto max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] leading-tight font-extrabold">
          Tu empresa declara su necesidad. Un equipo de Puebla propone la solución.
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href={companyAccountHref} className="btn w-full bg-white text-program-field sm:w-fit">
            Crear cuenta y registrar mi necesidad
          </Link>
          <Link href={teamAccountHref} className="font-bold text-white underline underline-offset-4">
            Soy equipo de desarrollo →
          </Link>
        </div>
      </div>
    </section>
  );
}
