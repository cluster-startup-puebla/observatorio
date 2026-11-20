"use client";

import { useEffect, useRef, useState } from "react";
import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import type { V2Question } from "@/lib/methodology/v2/types";
import { Curtain } from "./curtain";
import { V2Form } from "./form";
import { Result } from "./result";
import { SectorConfirm } from "./sector-confirm";
import { showCurtain, showResult } from "./screen-phase";
import { scheduleFlush } from "./sync";

type Pack = { id: string; label: string; questions: V2Question[]; roadmap: V2LevelStep[] };

export function ScreenView({
  profileId,
  brought,
  options,
  pack,
  draft,
  booted,
  onPull,
  onChoose,
  onEnter,
}: {
  profileId: string;
  brought: string;
  options: { id: string; label: string }[];
  pack: Pack | null;
  draft: V2Draft | null;
  booted: boolean;
  onPull: () => void;
  onChoose: (id: string) => void;
  onEnter: () => void;
}) {
  const finished = Boolean(draft && pack && showResult(draft, pack.questions.length));
  const [celebrate, setCelebrate] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    if (!booted) return;
    if (!seen.current) {
      seen.current = true;
      return;
    }
    if (finished) setCelebrate(true);
  }, [booted, finished]);

  if (!pack) {
    if (!booted) return null;
    return <SectorConfirm brought={brought} options={options} onConfirm={onChoose} />;
  }

  if (draft && finished) {
    return (
      <Result
        questions={pack.questions}
        answers={draft.answers}
        roadmap={pack.roadmap}
        draft={draft}
        celebrate={celebrate}
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
