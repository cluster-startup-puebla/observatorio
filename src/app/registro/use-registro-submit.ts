"use client";

import { useEffect, useState } from "react";
import { readRegistroDone } from "./registro-memory";
import { runRegistroSubmit } from "./run-registro-submit";

const empty = {
  fullName: "",
  jobTitle: "",
  email: "",
  whatsapp: "",
  companyName: "",
  marketSize: "",
  employeeBand: "",
  municipality: "",
  sectorSlug: "",
  referralSource: "",
  sessionInterest: "",
};

export function useRegistroSubmit(
  sector: string,
  invitacion: string,
  sessionId: string,
  lockedReferral?: string | null,
) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [yaTieneCuenta, setYaTieneCuenta] = useState(false);
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [values, setValues] = useState({ ...empty, referralSource: lockedReferral ?? "" });

  useEffect(() => {
    setDone(readRegistroDone());
    setReady(true);
  }, []);

  useEffect(() => {
    if (lockedReferral) setValues((current) => ({ ...current, referralSource: lockedReferral }));
  }, [lockedReferral]);

  function clearIssue() {
    setError("");
    setYaTieneCuenta(false);
  }

  function patch(next: Partial<typeof empty>) {
    clearIssue();
    setValues((current) => ({
      ...current,
      ...next,
      ...(lockedReferral ? { referralSource: lockedReferral } : {}),
    }));
  }

  function acceptTerms(next: boolean) {
    clearIssue();
    setTerms(next);
  }

  async function submit() {
    if (pending) return;
    setPending(true);
    clearIssue();
    const result = await runRegistroSubmit({ values, sector, invitacion, sessionId, lockedReferral, terms });
    if ("yaTieneCuenta" in result) setYaTieneCuenta(true);
    else if ("error" in result) setError(result.error);
    else setDone(true);
    setPending(false);
  }

  return { ready, done, error, yaTieneCuenta, pending, terms, acceptTerms, values, patch, submit };
}