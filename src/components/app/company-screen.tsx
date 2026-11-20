import { CompanyChecklist } from "@/components/app/company-checklist";
import { CompanyHeader } from "@/components/app/company-header";
import { ResultNote } from "@/components/methodology/v2/result-note";
import { ResultView } from "@/components/methodology/v2/result-view";
import { SectorRank } from "@/components/methodology/v2/sector-rank";
import type { CompanyHome } from "@/lib/app/company-score";
import { readResult } from "@/lib/methodology/v2/read-result";

const bands: Record<string, string> = {
  platino: "Platino",
  oro: "Oro",
  plata: "Plata",
  bronce: "Bronce",
};

function CompanyMedal({ home }: { home: CompanyHome }) {
  if (!home.score) return null;
  const band = home.score.band ? (bands[home.score.band] ?? home.score.band) : null;
  return <ResultNote shown={home.score.ismsNivel2} together band={band} reportHref="/metodologia" />;
}

function CompanyResult({ home }: { home: CompanyHome }) {
  if (!home.result) {
    return (
      <>
        <CompanyMedal home={home} />
        <SectorRank />
      </>
    );
  }
  const { questions, answers, roadmap } = home.result;
  return <ResultView read={readResult(questions, answers, roadmap)} questions={questions} answers={answers} />;
}

export function CompanyScreen({ home }: { home: CompanyHome }) {
  return (
    <div className="grid w-full min-w-0 max-w-lg gap-8 md:max-w-none">
      <CompanyHeader home={home} />
      <CompanyResult home={home} />
      <CompanyChecklist actions={home.actions} />
    </div>
  );
}
