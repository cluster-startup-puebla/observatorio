import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { opticalLogoHeight, PartnerMark } from "@/components/landing/atoms/partner-mark";
import { PartnerRow } from "@/components/landing/atoms/partner-row";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { backers, clusterLogo, partners } from "@/content/landing";

export function Backers() {
  return (
    <section id="respaldo" className="scroll-mt-24 border-y border-line bg-surface-subtle py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading title="Organismo empresarial. Respaldan las secretarías. Opera el Clúster." />
        <div className="mt-12">
          <Kicker>Convocan</Kicker>
          <div className="mt-4">
            <PartnerRow partners={partners} layout="natural" />
          </div>
          <p className="text-small mt-3 text-ink-secondary">{backers.alsoConvene}</p>
        </div>
        <div className="mt-10 grid items-center gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div>
            <Kicker>Respaldo institucional</Kicker>
            <div className="mt-4">
              <GovernmentLockup optical />
            </div>
          </div>
          <div>
            <Kicker>Opera</Kicker>
            <div className="mt-4">
              <PartnerMark
                src={clusterLogo.src}
                alt={clusterLogo.alt}
                width={clusterLogo.width}
                height={clusterLogo.height}
                className="h-auto w-auto object-contain"
                style={{ height: opticalLogoHeight(clusterLogo.width, clusterLogo.height) }}
              />
            </div>
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
