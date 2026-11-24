"use client";

import { useState } from "react";
import { Cpu, UserRound } from "lucide-react";
import { DebateBioDialog } from "@/components/sessions/disruptors/debate-bio-dialog";
import { DebateColumn } from "@/components/sessions/disruptors/debate-column";
import { DebateModerator } from "@/components/sessions/disruptors/debate-moderator";
import { DebateTopics } from "@/components/sessions/disruptors/debate-topics";
import { debateHeader, type DebatePanelist, type DebateSide } from "@/content/disruptors-debate";
import { debateHumanPanelists } from "@/content/disruptors-debate-human";
import { debateTechPanelists } from "@/content/disruptors-debate-tech";

export function DisruptorsDebate() {
  const [selected, setSelected] = useState<{ panelist: DebatePanelist; side: DebateSide } | null>(null);

  return (
    <section id="mesa-debate" className="scroll-mt-24 border-t border-line bg-surface py-16 lg:py-20">
      <div className="container-site">
        <header className="max-w-2xl">
          <span className="block h-1 w-12 bg-brand" aria-hidden />
          <p className="mt-4 text-micro font-semibold tracking-[0.16em] text-brand uppercase">
            {debateHeader.kicker}
          </p>
          <h2 className="text-h2 mt-2 text-balance text-ink">{debateHeader.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {debateHeader.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-line bg-surface px-3 py-1 text-micro font-semibold tracking-[0.08em] text-ink-secondary uppercase"
              >
                {badge}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <DebateColumn
            label="Tecnológica"
            accentClass="text-navy"
            icon={<Cpu className="size-5" aria-hidden />}
            panelists={debateTechPanelists}
            onSelect={(panelist) => setSelected({ panelist, side: "tech" })}
          />
          <DebateModerator />
          <DebateColumn
            label="Humana"
            accentClass="text-brand"
            alignRight
            icon={<UserRound className="size-5" aria-hidden />}
            panelists={debateHumanPanelists}
            onSelect={(panelist) => setSelected({ panelist, side: "human" })}
          />
        </div>

        <DebateTopics />
      </div>

      <DebateBioDialog selected={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
