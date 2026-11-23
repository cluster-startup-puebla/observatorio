export const sessionModalities = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "en_linea", label: "En línea" },
] as const;

export const sessionKinds = [
  { value: "foro", label: "Foro (cupos por sector)" },
  { value: "evento", label: "Evento abierto" },
] as const;

export type SessionModality = (typeof sessionModalities)[number]["value"];
export type SessionKind = (typeof sessionKinds)[number]["value"];

export function parseSessionModality(value: string): SessionModality | null {
  return sessionModalities.some((item) => item.value === value) ? (value as SessionModality) : null;
}

export function parseSessionKind(value: string): SessionKind | null {
  return sessionKinds.some((item) => item.value === value) ? (value as SessionKind) : null;
}

export function modalityLabel(value: string) {
  return sessionModalities.find((item) => item.value === value)?.label ?? value;
}

export function kindLabel(value: string) {
  return sessionKinds.find((item) => item.value === value)?.label ?? value;
}


export function sessionShapeFromForm(
  form: { get(name: string): FormDataEntryValue | null },
  fallback?: { modality?: string; kind?: string; instrument_id?: string | null },
) {
  const modality = parseSessionModality(String(form.get("modality") ?? fallback?.modality ?? ""));
  const kind = parseSessionKind(String(form.get("kind") ?? fallback?.kind ?? ""));
  const instrument = String(form.get("instrument_id") ?? fallback?.instrument_id ?? "").trim();
  if (!modality) return { ok: false as const, reason: "Elige el tipo de sesión." };
  if (!kind) return { ok: false as const, reason: "Elige la plantilla (foro o evento)." };
  return {
    ok: true as const,
    modality,
    kind,
    instrument_id: instrument || null,
  };
}
