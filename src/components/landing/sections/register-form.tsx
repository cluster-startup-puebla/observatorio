"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { downloadDiagnosticPdf } from "@/components/diagnostico/download-pdf";
import { RegisterBand } from "@/components/landing/sections/register-band";
import { empty, validate, type FormState } from "@/components/landing/sections/register-form-model";
import { RegisterFormView } from "@/components/landing/sections/register-form-view";
import { RegisterSuccess } from "@/components/landing/sections/register-success";
import { diagnosticDownloadParam } from "@/content/diagnostico-tmec";

export function RegisterForm({ variant = "page" }: { variant?: "band" | "page" }) {
  const downloadDiagnostic = useSearchParams().get("descarga") === diagnosticDownloadParam;
  const [values, setValues] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    setDownloadError("");
    if (downloadDiagnostic) {
      try {
        const error = await downloadDiagnosticPdf({
          name: values.name,
          company: values.company,
          industry: values.sector,
          email: values.email,
          origin: "registro",
        });
        if (error) setDownloadError(error);
      } catch {
        setDownloadError("No se pudo preparar la descarga. Intenta de nuevo.");
      }
    }
    setPending(false);
    setSent(true);
  }

  if (sent) {
    return <RegisterSuccess variant={variant} downloadDiagnostic={downloadDiagnostic} downloadError={downloadError} />;
  }

  const form = (
    <RegisterFormView
      variant={variant}
      values={values}
      errors={errors}
      pending={pending}
      downloadDiagnostic={downloadDiagnostic}
      onSubmit={onSubmit}
      update={update}
    />
  );

  if (variant === "band") return <RegisterBand>{form}</RegisterBand>;
  return form;
}
