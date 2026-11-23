import Image from "next/image";
import Link from "next/link";
import { ClusterMark } from "@/components/program/cluster-mark";
import {
  disruptorsKicker,
  disruptorsLead,
  disruptorsReserveHref,
  disruptorsTagline,
} from "@/content/disruptors";

export function DisruptorsHero() {
  return (
    <section id="inicio" className="bg-black text-white">
      <div className="container-site grid gap-8 py-10 sm:py-12 lg:gap-10 lg:py-14">
        <div className="grid gap-5">
          <Image
            src="/disruptors/logo.png"
            alt="DISRUPTORS"
            width={2053}
            height={766}
            priority
            className="h-10 w-auto sm:h-12 lg:h-14"
          />
          <p className="text-small font-semibold tracking-[0.18em] text-white/55 uppercase">
            {disruptorsTagline}
          </p>
          <h1 className="max-w-2xl text-balance font-display text-[clamp(1.85rem,3vw,2.6rem)] leading-[1.1] font-bold tracking-[-0.02em]">
            2026 · Human Intelligence
          </h1>
        </div>

        <div className="grid max-w-2xl gap-5 border-t border-white/15 pt-8">
          <div className="grid gap-3">
            <p className="text-micro uppercase text-white/55">{disruptorsKicker}</p>
            <ClusterMark light className="h-12 w-auto text-white sm:h-14" />
          </div>
          <p className="text-body-lg text-white/75">{disruptorsLead}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={disruptorsReserveHref} className="btn bg-white text-black hover:bg-white/90">
              Registrarme
            </Link>
            <Link
              href="#ponentes"
              className="btn border border-white/70 bg-transparent text-white hover:bg-white/10"
            >
              Conoce a los speakers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
