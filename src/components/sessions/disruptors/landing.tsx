import { DisruptorsAbout } from "@/components/sessions/disruptors/about";
import { DisruptorsDebate } from "@/components/sessions/disruptors/debate";
import { DisruptorsHero } from "@/components/sessions/disruptors/hero";
import { DisruptorsMoments } from "@/components/sessions/disruptors/moments";
import { DisruptorsReserve } from "@/components/sessions/disruptors/reserve";
import { DisruptorsSpeakers } from "@/components/sessions/disruptors/speakers";

export function DisruptorsLanding() {
  return (
    <div className="flex flex-1 flex-col">
      <DisruptorsHero />
      <DisruptorsAbout />
      <DisruptorsMoments />
      <DisruptorsDebate />
      <DisruptorsSpeakers />
      <DisruptorsReserve />
    </div>
  );
}
