import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { ClusterMark } from "@/components/program/cluster-mark";
import { NamedGovernment } from "@/components/program/named-government";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { conveners } from "@/content/conveners";

export function ProgramAllies() {
  return (
    <section id="aliados" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="container-site py-16 lg:py-20">
        <h2 className="text-h2 text-ink">Aliados</h2>
        <p className="mt-3 max-w-2xl text-body text-ink-secondary">
          Cámaras, clústeres y gobierno que convocaron Foro Puebla x Puebla.
        </p>
        <ClusterMark className="mt-10 h-20 w-auto" />
        <div className="mt-12 sm:hidden">
          <NamedGovernment />
        </div>
        <div className="mt-12 hidden sm:block">
          <GovernmentLockup />
        </div>
        <div className="mt-12">
          <LogoCarousel
            logos={conveners.map((logo) => ({
              name: logo.alt,
              src: logo.src,
              width: logo.width,
              height: logo.height,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
