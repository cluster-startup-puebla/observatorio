import indexFile from "@/content/methodology/v2/index.json";
import n1File from "@/content/methodology/v2/n1.json";
import type { RunRow } from "@/lib/methodology/v2/apply-run";
import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import { loadSector } from "@/lib/methodology/v2/load-sector";
import { pickDraft } from "@/lib/methodology/v2/recover";
import { instrumentChoice, type InstrumentChoice } from "@/lib/methodology/v2/sector-map";
import { sessionQuestions } from "@/lib/methodology/v2/sequence";
import type { V2Question } from "@/lib/methodology/v2/types";
import { sectors } from "@/lib/sectors";
import { signedSector } from "./load-run-sector";

const n1 = n1File.questions as V2Question[];
const sectorQuestionId = indexFile.sectorQuestionId;

export type InstrumentPack = {
  id: string;
  label: string;
  questions: V2Question[];
  roadmap: V2LevelStep[];
};

export type LoadedRun = {
  choice: InstrumentChoice;
  questions: V2Question[];
  roadmap: V2LevelStep[];
  draft: V2Draft | null;
  profileId: string;
  instrumentId: string;
  packs: InstrumentPack[];
  disclaimerAcceptedAt: string | null;
  brought: string;
};

function remoteDraft(row: RunRow | null): V2Draft | null {
  if (!row) return null;
  return {
    instrumentId: row.instrument_id,
    answers: row.answers,
    index: row.cursor,
    phase: row.phase,
    updatedAt: row.updated_at,
    sentAt: row.updated_at,
  };
}

function labelFor(id: string) {
  return indexFile.instruments.find((item) => item.id === id)?.label ?? id;
}

async function packFor(id: string): Promise<InstrumentPack | null> {
  const sector = await loadSector(id);
  if (!sector) return null;
  return {
    id,
    label: labelFor(id),
    questions: sessionQuestions(n1, sector.questions, sectorQuestionId),
    roadmap: sector.roadmap,
  };
}

function idsFor(choice: InstrumentChoice) {
  if (choice.kind === "one") return [choice.id];
  if (choice.kind === "pick") return [...choice.ids];
  return [];
}

export async function loadRun(): Promise<LoadedRun> {
  const signed = await signedSector();
  const choice = instrumentChoice(signed.slug);
  const draft = pickDraft(null, remoteDraft(signed.remote));
  const loaded = await Promise.all(idsFor(choice).map((id) => packFor(id)));
  const packs = loaded.filter((item): item is InstrumentPack => item !== null);
  const chosen =
    packs.find((item) => item.id === draft?.instrumentId) ??
    (choice.kind === "one" ? packs[0] : undefined);

  return {
    choice,
    questions: chosen?.questions ?? [],
    roadmap: chosen?.roadmap ?? [],
    draft,
    profileId: signed.profileId,
    instrumentId: chosen?.id ?? "",
    packs,
    disclaimerAcceptedAt: signed.disclaimerAcceptedAt,
    brought: signed.name || sectors.find((item) => item.slug === signed.slug)?.name || signed.slug,
  };
}
