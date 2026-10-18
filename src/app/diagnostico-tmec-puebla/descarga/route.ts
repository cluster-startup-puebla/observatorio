import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { diagnosticIndustries, diagnosticPdfName } from "@/content/diagnostico-tmec";

const pdfPath = path.join(process.cwd(), "private", "diagnostico-integral-puebla-tmec.pdf");

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const name = text(form, "nombre");
  const company = text(form, "empresa");
  const industry = text(form, "industria");
  const email = text(form, "correo");
  const privacy = text(form, "aviso") === "si";
  const fromRegister = text(form, "origen") === "registro";

  const industryOk = fromRegister
    ? industry.length >= 2
    : diagnosticIndustries.includes(industry as (typeof diagnosticIndustries)[number]);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (name.length < 2 || company.length < 2 || !industryOk || !emailOk || !privacy) {
    return NextResponse.json(
      { error: "Revisa nombre, empresa, industria, correo y la aceptación del aviso." },
      { status: 400 },
    );
  }

  try {
    const directory = path.join(process.cwd(), "data");
    await mkdir(directory, { recursive: true });
    await appendFile(
      path.join(directory, "diagnostic-leads.ndjson"),
      `${JSON.stringify({
        name,
        company,
        industry,
        email,
        origin: fromRegister ? "registro" : "formulario",
        privacyAcceptedAt: new Date().toISOString(),
      })}\n`,
    );
  } catch (error) {
    console.error("No se pudo guardar el lead del diagnóstico", error);
  }

  try {
    const pdf = await readFile(pdfPath);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${diagnosticPdfName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "El diagnóstico no está disponible en este momento." },
      { status: 404 },
    );
  }
}
