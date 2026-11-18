"use client";

import { toast } from "sonner";
import { readDraft, writeDraft, type V2Draft } from "@/lib/methodology/v2/draft";
import { flushPlan } from "@/lib/methodology/v2/flush";

type Entering = "answer" | "curtain" | "done" | "online";
type FlushScore = { ismsNivel2: number; band: string | null };
const prefix = "metodologia-v2:";
let ownerId: string | null = null;
let held: V2Draft | null = null;

function answerCount(draft: V2Draft) {
  return Object.keys(draft.answers).filter((id) => id !== "MOD0-WEB-01").length;
}

function ownerFor(draft: V2Draft) {
  if (ownerId || typeof localStorage === "undefined") return ownerId;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (readDraft(localStorage, id)?.updatedAt !== draft.updatedAt) continue;
    ownerId = id;
    break;
  }
  return ownerId;
}

function markSent(draft: V2Draft) {
  const owner = ownerFor(draft);
  if (!owner) return;
  const current = readDraft(localStorage, owner);
  const base = current && current.updatedAt > draft.updatedAt ? current : draft;
  const sentAt = current?.sentAt && current.sentAt > draft.updatedAt ? current.sentAt : draft.updatedAt;
  const marked = { ...base, sentAt };
  if (!held || held.updatedAt <= draft.updatedAt) held = marked;
  writeDraft(localStorage, owner, marked);
}

export function scheduleFlush(draft: V2Draft, entering: Entering, score?: FlushScore) {
  held = draft;
  ownerFor(draft);
  const pending = draft.sentAt === null || draft.updatedAt > draft.sentAt;
  const online = entering === "online" || (typeof navigator !== "undefined" && navigator.onLine);
  if (!online) {
    toast("Sin conexión. Tus respuestas siguen en este teléfono.");
    return;
  }
  const reason = flushPlan({
    phase: draft.phase,
    answerCount: answerCount(draft),
    pending,
    online,
    entering,
  });
  if (!reason) return;
  const body = {
    instrumentId: draft.instrumentId,
    answers: draft.answers,
    index: draft.index,
    phase: draft.phase,
    updatedAt: draft.updatedAt,
    ...(reason === "done" ? { score: score ?? null } : {}),
  };
  fetch("/api/metodologia/envio", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) throw new Error("envio");
      markSent(draft);
    })
    .catch(() => {
      toast("Sin conexión. Tus respuestas siguen en este teléfono.");
    });
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (held) scheduleFlush(held, "online");
  });
}
