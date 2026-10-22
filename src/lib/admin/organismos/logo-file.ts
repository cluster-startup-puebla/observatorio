import { logoObjectPath } from "@/lib/storage-assets";

export type LogoBytes = { bytes: Uint8Array; contentType: string };

export async function readLogoFile(file: FormDataEntryValue | null): Promise<LogoBytes | { error: string } | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 2_097_152) return { error: "pasa de 2 MB" };
  try {
    logoObjectPath("org", file.type);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "tipo de imagen no permitido" };
  }
  return { bytes: new Uint8Array(await file.arrayBuffer()), contentType: file.type };
}
