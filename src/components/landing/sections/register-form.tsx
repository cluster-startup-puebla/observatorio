"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { downloadDiagnosticPdf } from "@/components/diagnostico/download-pdf";
import { companySizes, ctaLabel } from "@/content/landing";
import { diagnosticDownloadParam } from "@/content/diagnostico-tmec";
import { SourceCombobox } from "@/components/landing/molecules/source-combobox";

type FormState = {
  name: string;
  role: string;
  company: string;
  sector: string;
  size: string;
  email: string;
  whatsapp: string;
  source: string;
  privacy: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

const empty: FormState = {
  name: "",
  role: "",
  company: "",
  sector: "",
  size: "",
  email: "",
  whatsapp: "",
  source: "",
  privacy: false,
};

const successCopy =
  "Cupo de 15 a 30 empresas por sesión. El Clúster confirma el lugar por correo o WhatsApp cuando el registro quede conectado.";

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Escribe tu nombre.";
  if (values.role.trim().length < 2) errors.role = "Escribe tu cargo.";
  if (values.company.trim().length < 2) errors.company = "Escribe el nombre de tu empresa.";
  if (values.sector.trim().length < 2) errors.sector = "Indica tu sector o actividad.";
  if (!values.size) errors.size = "Elige un rango de empleados.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Escribe un correo válido.";
  if (values.whatsapp.replace(/\D/g, "").length < 10) errors.whatsapp = "Escribe un WhatsApp de 10 dígitos.";
  if (!values.source) errors.source = "Cuéntanos cómo te enteraste.";
  if (!values.privacy) errors.privacy = "Necesitamos tu aceptación del aviso de privacidad.";
  return errors;
}

function SuccessLinks({ quietClassName }: { quietClassName: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small">
      <a href="/login" className="text-link">
        Entrar
      </a>
      <a href="/verificar" className={quietClassName}>
        Revisar confirmación
      </a>
    </div>
  );
}

export function RegisterForm({ variant = "page" }: { variant?: "band" | "page" }) {
  const downloadDiagnostic = useSearchParams().get("descarga") === diagnosticDownloadParam;
  const [values, setValues] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
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

  if (sent && variant === "band") {
    return (
      <section id="registro" className="scroll-mt-24 band-ink py-20 lg:py-28">
        <div className="container-site max-w-2xl">
          <h2 className="text-h2 text-balance">Tu lugar quedó solicitado.</h2>
          <p className="text-body-lg band-ink-muted mt-4">
            {successCopy}
            {downloadDiagnostic && !downloadError
              ? " El diagnóstico integral se está descargando."
              : ""}
          </p>
          {downloadError ? <p className="text-small text-mark mt-3">{downloadError}</p> : null}
          <div className="mt-6">
            <SuccessLinks quietClassName="band-ink-muted underline underline-offset-4" />
          </div>
        </div>
      </section>
    );
  }

  if (sent) {
    return (
      <div className="grid gap-4 text-ink">
        <h2 className="text-h2 text-balance">Tu lugar quedó solicitado.</h2>
        <p className="text-body-lg text-ink-secondary">
          {successCopy}
          {downloadDiagnostic && !downloadError ? " El diagnóstico integral se está descargando." : ""}
        </p>
        {downloadError ? <p className="text-small text-mark">{downloadError}</p> : null}
        <SuccessLinks quietClassName="text-ink-muted underline underline-offset-4" />
      </div>
    );
  }

  const form = (
    <form
      onSubmit={onSubmit}
      noValidate
      className={
        variant === "band"
          ? "grid gap-5 rounded-md bg-surface p-6 text-ink lg:p-8"
          : "grid gap-5 text-ink"
      }
    >
      <Field id="nombre" label="Nombre" error={errors.name}>
        <input
          id="nombre"
          name="nombre"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "nombre-error" : undefined}
        />
      </Field>
      <Field id="cargo" label="Cargo" error={errors.role}>
        <input
          id="cargo"
          name="cargo"
          value={values.role}
          onChange={(event) => update("role", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? "cargo-error" : undefined}
        />
      </Field>
      <Field id="empresa" label="Empresa (confidencial)" error={errors.company}>
        <input
          id="empresa"
          name="empresa"
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "empresa-error" : undefined}
        />
      </Field>
      <Field id="sector" label="Sector o actividad principal" error={errors.sector}>
        <input
          id="sector"
          name="sector"
          value={values.sector}
          onChange={(event) => update("sector", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.sector)}
          aria-describedby={errors.sector ? "sector-error" : undefined}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-small font-semibold text-ink">Número de empleados</legend>
        <div className="flex flex-wrap gap-2">
          {companySizes.map((size) => (
            <label key={size} className="text-small">
              <input
                type="radio"
                name="empleados"
                value={size}
                checked={values.size === size}
                onChange={() => update("size", size)}
                className="peer sr-only"
              />
              <span className="inline-flex cursor-pointer rounded-full border border-line px-4 py-2 peer-checked:border-brand peer-checked:text-mark">
                {size}
              </span>
            </label>
          ))}
        </div>
        {errors.size ? <p className="text-small text-mark">{errors.size}</p> : null}
      </fieldset>
      <Field id="correo" label="Correo" error={errors.email}>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "correo-error" : undefined}
        />
      </Field>
      <Field id="whatsapp" label="WhatsApp" error={errors.whatsapp}>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          autoComplete="tel"
          value={values.whatsapp}
          onChange={(event) => update("whatsapp", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.whatsapp)}
          aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
        />
      </Field>
      <Field id="fuente" label="¿Cómo te enteraste?" error={errors.source}>
        <SourceCombobox value={values.source} onChange={(source) => update("source", source)} error={errors.source} />
      </Field>
      <div className="grid gap-2">
        <label className="flex items-start gap-3 text-small text-ink-secondary">
          <input
            type="checkbox"
            checked={values.privacy}
            onChange={(event) => update("privacy", event.target.checked)}
            className="mt-1"
          />
          <span>
            Acepto el{" "}
            <a href="/aviso-de-privacidad" className="text-link">
              aviso de privacidad
            </a>{" "}
            y el{" "}
            <a href="/uso-de-datos" className="text-link">
              uso de datos
            </a>
            .
          </span>
        </label>
        {errors.privacy ? <p className="text-small text-mark">{errors.privacy}</p> : null}
      </div>
      {downloadDiagnostic ? (
        <p className="text-small text-ink-secondary">
          Al terminar se descarga el diagnóstico integral de VIA Partners.
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Preparando…" : downloadDiagnostic ? "Registrarme y descargar" : ctaLabel}
      </button>
      <p className="text-small text-ink-muted">
        Cupo limitado de 15 a 30 empresas por sesión. Sin costo.
      </p>
      <div className="flex flex-wrap items-center gap-3 text-small text-ink-secondary">
        <Kicker>Con el respaldo de</Kicker>
        <GovernmentLockup />
      </div>
    </form>
  );

  if (variant === "band") {
    return (
      <section id="registro" className="scroll-mt-24 band-ink py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <h2 className="text-h2 text-balance">
              Tu sector va a ser escuchado. Asegura que tu empresa esté en la mesa.
            </h2>
            <p className="text-body-lg band-ink-muted mt-4">
              Cupo limitado de 15 a 30 empresas por sesión. Sin costo.
            </p>
          </div>
          {form}
        </div>
      </section>
    );
  }

  return form;
}
