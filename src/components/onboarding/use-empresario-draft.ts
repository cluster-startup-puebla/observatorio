"use client";

import { useEffect, useState } from "react";
import { emptyEmpresarioValues } from "@/lib/onboarding/empresario-steps";
import { readEmpresarioDraft, writeEmpresarioDraft } from "./empresario-draft-storage";

export function useEmpresarioDraft(accountId: string, sectorSlug: string | null) {
  const slug = sectorSlug ?? "";
  const [values, setValues] = useState(() => emptyEmpresarioValues(slug));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValues(readEmpresarioDraft(sessionStorage, accountId, slug));
    setReady(true);
  }, [accountId, slug]);

  useEffect(() => {
    if (!ready) return;
    writeEmpresarioDraft(sessionStorage, accountId, values);
  }, [ready, accountId, values]);

  return [values, setValues] as const;
}
