"use client";

import { useMemo, useState } from "react";

export function useQuotaTotal(initial: Record<string, number>) {
  const [values, setValues] = useState(initial);
  const total = useMemo(
    () => Object.values(values).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0),
    [values],
  );

  function setCapacity(sectorId: string, raw: string) {
    const next = raw.trim() === "" ? 0 : Number(raw);
    setValues((current) => ({
      ...current,
      [sectorId]: Number.isFinite(next) && next >= 0 ? next : 0,
    }));
  }

  function replaceAll(next: Record<string, number>) {
    setValues(next);
  }

  return { values, total, setCapacity, replaceAll };
}
