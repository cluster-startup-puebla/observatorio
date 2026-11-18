"use client";

import { useEffect, useState } from "react";
import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import { readDraft, writeDraft, type V2Draft } from "@/lib/methodology/v2/draft";
import { pickDraft } from "@/lib/methodology/v2/recover";
import type { InstrumentChoice } from "@/lib/methodology/v2/sector-map";
import type { V2Question } from "@/lib/methodology/v2/types";
import { touch } from "./move";
import { freshDraft, initialInstrument } from "./screen-phase";
import { ScreenView } from "./screen-view";
import { scheduleFlush } from "./sync";

type Pack = { id: string; label: string; questions: V2Question[]; roadmap: V2LevelStep[] };

export function MetodologiaScreen({
  profileId,
  remote,
  choice,
  packs,
}: {
  profileId: string;
  remote: V2Draft | null;
  choice: InstrumentChoice;
  packs: Pack[];
}) {
  const [draft, setDraft] = useState(remote);
  const [instrumentId, setInstrumentId] = useState(() =>
    initialInstrument(
      remote,
      choice,
      packs.map((item) => item.id),
    ),
  );
  const [booted, setBooted] = useState(false);
  const pack = packs.find((item) => item.id === instrumentId) ?? null;

  useEffect(() => {
    try {
      const next = pickDraft(readDraft(localStorage, profileId), remote);
      const known = next?.instrumentId && packs.some((item) => item.id === next.instrumentId);
      if (choice.kind === "pick" && known && next) setInstrumentId(next.instrumentId);
      setDraft(next);
    } catch {
      setDraft(remote);
    }
    setBooted(true);
  }, [choice.kind, packs, profileId, remote]);

  function pull() {
    try {
      const next = pickDraft(readDraft(localStorage, profileId), remote);
      if (next) setDraft(next);
    } catch {
      return;
    }
  }

  function choose(id: string) {
    const next = freshDraft(id);
    writeDraft(localStorage, profileId, next);
    setInstrumentId(id);
    setDraft(next);
  }

  function enter() {
    if (!draft) return;
    const next = touch(draft, { phase: "sector" });
    writeDraft(localStorage, profileId, next);
    setDraft(next);
    scheduleFlush(next, "curtain");
  }

  return (
    <ScreenView
      profileId={profileId}
      choice={choice}
      pack={pack}
      draft={draft}
      booted={booted}
      onPull={pull}
      onChoose={choose}
      onEnter={enter}
    />
  );
}
