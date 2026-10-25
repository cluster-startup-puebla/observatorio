import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { PartnerMark } from "@/components/landing/atoms/partner-mark";
import { ConvenerRow } from "@/components/landing/atoms/convener-row";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { clusterLogo } from "@/content/landing";

export function Backers() {
  return (
    <section id="respaldo" className="scroll-mt-24 border-y border-line bg-surface-subtle py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading title="Organismo empresarial. Respaldan las secretarías. Opera el Clúster." />
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
          <div>
            <Kicker>Opera</Kicker>
            <div className="mt-4">
              <PartnerMark
                src={clusterLogo.src}
                alt={clusterLogo.alt}
                width={clusterLogo.width}
                height={clusterLogo.height}
                className="h-12 w-auto object-contain sm:h-12"
              />
            </div>
          </div>
          <div>
            <Kicker>Con el respaldo de</Kicker>
            <div className="mt-4">
              <GovernmentLockup optical />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-8">
          <Kicker>Convocan</Kicker>
          <div className="mt-4">
            <ConvenerRow />
          </div>
        </div>
        <p className="text-body mt-10 max-w-2xl text-ink-secondary">
          Recibes la invitación de tu propia cámara, con respaldo del estado. Es un esfuerzo serio,
          no una iniciativa aislada.
        </p>
      </div>
    </section>
  );
}
