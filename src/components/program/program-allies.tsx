import { ConvenerRow } from "@/components/landing/atoms/convener-row";
import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { ClusterMark } from "@/components/program/cluster-mark";

export function ProgramAllies() {
  return (
    <section id="aliados" className="border-t border-line bg-surface">
      <div className="container-site py-16 lg:py-20">
        <h2 className="text-h2 text-ink">Aliados</h2>
        <p className="mt-3 max-w-2xl text-body text-ink-secondary">
          Cámaras, clústeres y gobierno que convocaron el levantamiento.
        </p>
        <ClusterMark className="mt-10 h-20 w-auto" />
        <div className="mt-12">
          <GovernmentLockup />
        </div>
        <div className="mt-10">
          <ConvenerRow />
        </div>
      </div>
    </section>
  );
}
