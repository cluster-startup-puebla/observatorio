"use client";

import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import type { InstrumentChoice } from "@/lib/methodology/v2/sector-map";
import type { V2Question } from "@/lib/methodology/v2/types";
import { Curtain } from "./curtain";
import { V2Form } from "./form";
import { Pick } from "./pick";
import { Result } from "./result";
import { showCurtain, showResult } from "./screen-phase";
import { scheduleFlush } from "./sync";

type Pack = { id: string; label: string; questions: V2Question[]; roadmap: V2LevelStep[] };

export function ScreenView({
  profileId,
  choice,
  pack,
  draft,
  booted,
  onPull,
  onChoose,
  onEnter,
}: {
  profileId: string;
  choice: InstrumentChoice;
  pack: Pack | null;
  draft: V2Draft | null;
  booted: boolean;
  onPull: () => void;
  onChoose: (id: string) => void;
  onEnter: () => void;
}) {
  if (choice.kind === "pick" && !pack) return <Pick ids={[...choice.ids]} onChoose={onChoose} />;
  if (!pack) return null;

  if (draft && showResult(draft, pack.questions.length)) {
    return (
      <Result
        questions={pack.questions}
        answers={draft.answers}
        roadmap={pack.roadmap}
        draft={draft}
        scheduleFlush={scheduleFlush}
      />
    );
  }

  if (draft && showCurtain(draft, pack.questions)) return <Curtain name={pack.label} onEnter={onEnter} />;

  return (
    <div onClick={onPull}>
      <V2Form
        key={booted ? "phone" : "server"}
        profileId={profileId}
        instrumentId={pack.id}
        questions={pack.questions}
        initial={draft}
        onCommit={onPull}
      />
    </div>
  );
}
