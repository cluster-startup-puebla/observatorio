import { ConvenerRow } from "@/components/landing/atoms/convener-row";
import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { PartnerMark } from "@/components/landing/atoms/partner-mark";
import { clusterLogo } from "@/content/landing";

export function LandingMarks() {
  return (
    <div className="grid gap-8 border-t border-line pt-8">
      <ul className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-12">
        <li className="grid gap-2">
          <Kicker>Opera</Kicker>
          <PartnerMark
            src={clusterLogo.src}
            alt={clusterLogo.alt}
            width={clusterLogo.width}
            height={clusterLogo.height}
            className={clusterLogo.className}
          />
        </li>
        <li className="grid gap-2">
          <Kicker>Con el respaldo de</Kicker>
          <GovernmentLockup />
        </li>
      </ul>
      <div id="convocan" className="grid scroll-mt-24 gap-3">
        <Kicker>Convocan</Kicker>
        <ConvenerRow />
      </div>
    </div>
  );
}
