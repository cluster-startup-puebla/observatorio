"use client";

import { useState } from "react";
import { finishRegistro, startRegistro } from "./actions";

const empty = {
  fullName: "",
  jobTitle: "",
  email: "",
  whatsapp: "",
  companyName: "",
  marketSize: "",
  employeeBand: "",
  municipality: "",
  referralSource: "",
  sessionInterest: "",
};

const fallback = "No se pudo guardar. Revisa los datos e intenta de nuevo.";

export function useRegistroForm(sector: string, invitacion: string) {
  const [step, setStep] = useState(0);
  const [id, setId] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [values, setValues] = useState(empty);

  function patch(next: Partial<typeof empty>) {
    setError("");
    setValues((current) => ({ ...current, ...next }));
  }

  function back() {
    setError("");
    setStep(0);
  }

  async function submit() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      if (step === 0) await begin();
      else await close();
    } catch {
      setError(fallback);
    } finally {
      setPending(false);
    }
  }

  async function begin() {
    const started = await startRegistro({
      fullName: values.fullName,
      jobTitle: values.jobTitle,
      email: values.email,
      whatsapp: values.whatsapp,
      sectorSlug: sector,
      inviteToken: invitacion,
    });
    if ("error" in started) {
      setError(started.error ?? fallback);
      return;
    }
    setId(started.id);
    setStep(1);
  }

  async function close() {
    const finished = await finishRegistro({
      registrationId: id,
      ...values,
      sectorSlug: sector,
      terms,
    });
    if ("error" in finished) {
      setError(finished.error ?? fallback);
      return;
    }
    setDone(true);
  }

  return { step, done, error, pending, terms, setTerms, values, patch, back, submit };
}
