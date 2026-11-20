import { connection } from "next/server";
import { Newspaper } from "lucide-react";
import { ComingCard } from "@/components/app/coming-card";
import { EvaluationBanner } from "@/components/app/evaluation-banner";
import { HomeGreeting } from "@/components/app/home-greeting";
import { HomeHeader } from "@/components/app/home-header";
import { InnovationBanner } from "@/components/app/innovation-banner";
import { ProfileGapBanner } from "@/components/app/profile-gap-banner";
import { SessionBanner } from "@/components/app/session-banner";
import { loadHome } from "@/lib/app/load-home";

export const instant = false;

export default async function HomePage() {
  await connection();
  const home = await loadHome();
  const now = new Date();

  return (
    <div className="grid w-full max-w-lg gap-6 md:max-w-none">
      <header className="grid gap-4">
        <HomeHeader name={home.name} />
        <HomeGreeting name={home.name} date={now} />
      </header>
      <ProfileGapBanner gaps={home.gaps} email={home.email} />
      <InnovationBanner show={home.showInnovation} />
      <EvaluationBanner show={home.showEvaluation} />
      <SessionBanner next={home.next} />
      <section className="grid gap-4 border-t border-line pt-6">
        <h2 className="text-h3 text-ink">Feed</h2>
        <ComingCard
          feed
          icon={Newspaper}
          title="Noticias"
          body="Aquí vas a ver los avisos del Observatorio."
        />
      </section>
    </div>
  );
}
