import Link from "next/link";
import { FieldMark } from "./program-hero";

export function ProgramHowClose() {
  return (
    <div className="bg-program-field text-white">
      <div className="container-site py-10 lg:py-14">
        <FieldMark className="h-10 w-auto text-white sm:h-16" />
        <p className="mt-4 max-w-[36ch] text-lg leading-snug">Para la empresa y para el equipo de desarrollo.</p>
        <Link href="/crear-cuenta" className="btn mt-5 w-full bg-white text-center text-program-field sm:w-fit">
          Crear cuenta en Foro Puebla x Puebla
        </Link>
        <p className="mt-3 max-w-[42ch] text-base leading-snug">
          La empresa declara su necesidad. El equipo propone la salida.
        </p>
        <div aria-hidden className="relative mt-8 h-2">
          <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/70" />
          <span className="absolute top-1/2 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          <span className="absolute top-1/2 right-0 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
