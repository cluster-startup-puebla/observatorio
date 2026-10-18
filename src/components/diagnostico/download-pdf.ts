import { diagnosticPdfName } from "@/content/diagnostico-tmec";

export async function downloadDiagnosticPdf(fields: {
  name: string;
  company: string;
  industry: string;
  email: string;
  origin?: "registro";
}) {
  const body = new FormData();
  body.set("nombre", fields.name.trim());
  body.set("empresa", fields.company.trim());
  body.set("industria", fields.industry.trim());
  body.set("correo", fields.email.trim());
  body.set("aviso", "si");
  if (fields.origin) body.set("origen", fields.origin);

  const response = await fetch("/diagnostico-tmec-puebla/descarga", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? "No se pudo preparar la descarga. Intenta de nuevo.";
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = diagnosticPdfName;
  link.click();
  URL.revokeObjectURL(url);
  return null;
}
