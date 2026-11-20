import { ClusterMark } from "@/components/program/cluster-mark";
import { AllyReel } from "./ally-reel";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

export function PxpAllies() {
  return (
    <PxpFrame id="aliados">
      <PxpHeading eyebrow="Aliados" title="Cámaras, clústeres y gobierno que convocan Puebla x Puebla" />
      <div className="mt-12 grid items-center gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <ClusterMark className="h-20 w-auto" />
        <AllyReel />
      </div>
    </PxpFrame>
  );
}
