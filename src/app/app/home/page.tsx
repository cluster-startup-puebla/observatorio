import { Newspaper } from "lucide-react";
import { ComingCard } from "@/components/app/coming-card";
import { EvaluationBanner } from "@/components/app/evaluation-banner";
import { HomeGreeting } from "@/components/app/home-greeting";
import { LavasChip } from "@/components/app/lavas-chip";
import { ProfileGapBanner } from "@/components/app/profile-gap-banner";
import { SessionBanner } from "@/components/app/session-banner";
import { loadHome } from "@/lib/app/load-home";

export const instant = false;

export default async function HomePage() {
  const home = await loadHome();

  return (
    <div className="grid w-full max-w-lg gap-6 md:max-w-none">
      <div className="flex items-start justify-between gap-3">
        <HomeGreeting name={home.name} date={new Date()} />
        <LavasChip />
      </div>
      <ProfileGapBanner gaps={home.gaps} counter={home.counter} />
      <SessionBanner next={home.next} />
      <EvaluationBanner show={home.showEvaluation} />
      <ComingCard
        icon={Newspaper}
        title="Noticias"
        body="Aquí vas a ver los avisos del Observatorio."
      />
    </div>
  );
}
