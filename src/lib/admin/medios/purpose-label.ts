const labels: Record<string, string> = {
  organization_logo: "Logo de organismo",
  pass_qr: "Pase QR",
  content_image: "Imagen de contenido",
  company_logo: "Logo de empresa",
};

export function purposeLabel(purpose: string) {
  return labels[purpose] ?? purpose;
}
