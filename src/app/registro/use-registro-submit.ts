"use client";

import { useEffect, useState } from "react";
import { submitRegistro } from "./actions";
import { readRegistroDone, rememberRegistro } from "./registro-memory";

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

const fallback = "No se pudo guardar. Revisa los datos e intenta de nuevo.";

export function useRegistroSubmit(sector: string, invitacion: string) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [values, setValues] = useState(empty);

  useEffect(() => {
    setDone(readRegistroDone());
    setReady(true);
  }, []);

  function patch(next: Partial<typeof empty>) {
    setError("");
    setValues((current) => ({ ...current, ...next }));
  }

  function acceptTerms(next: boolean) {
    setError("");
    setTerms(next);
  }

  async function submit() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await submitRegistro({
        ...values,
        sectorSlug: sector || values.sectorSlug,
        inviteToken: invitacion,
        terms,
      });
      if ("error" in result) {
        setError(result.error ?? fallback);
        return;
      }
      rememberRegistro();
      setDone(true);
    } catch {
      setError(fallback);
    } finally {
      setPending(false);
    }
  }

  return { ready, done, error, pending, terms, acceptTerms, values, patch, submit };
}
