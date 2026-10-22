const labels: Record<string, string> = {
  organization_logo: "Logo de organismo",
  pass_qr: "Pase QR",
  content_image: "Imagen de contenido",
};

export function purposeLabel(purpose: string) {
  return labels[purpose] ?? purpose;
}
