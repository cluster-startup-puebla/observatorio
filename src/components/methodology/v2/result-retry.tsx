"use client";

import { useEffect, useState } from "react";
import type { V2Band } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import { flushDone, type DoneFlush } from "./result-flush";

export function useResultSend(
  scheduleFlush: DoneFlush | undefined,
  draft: V2Draft,
  note: number | null,
  band: V2Band | null,
) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    void flushDone(scheduleFlush, draft, note, band).then((ok) => {
      if (live) setFailed(!ok);
    });
    return () => {
      live = false;
    };
  }, [scheduleFlush, draft, note, band]);

  function retry() {
    setFailed(false);
    void flushDone(scheduleFlush, draft, note, band).then((ok) => setFailed(!ok));
  }

  return { failed, retry };
}

export function ResultRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" className="btn btn-primary" onClick={onRetry}>
      Reintentar envío
    </button>
  );
}
