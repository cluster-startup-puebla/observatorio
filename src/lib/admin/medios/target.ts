import { contentObjectPath, logoObjectPath, passObjectPath } from "@/lib/storage-assets";

const limits = {
  organization_logo: 2_097_152,
  pass_qr: 524_288,
  content_image: 4_194_304,
} as const;

export function mediaByteLimit(purpose: keyof typeof limits) {
  return limits[purpose];
}

export function mediaTarget(input: {
  purpose: keyof typeof limits;
  organizationId?: string;
  profileId?: string;
  slug?: string;
  filename?: string;
  contentType: string;
}) {
  if (input.purpose === "organization_logo") {
    if (!input.organizationId) throw new Error("falta el organismo");
    return { bucket: "organization-logos", path: logoObjectPath(input.organizationId, input.contentType) };
  }
  if (input.purpose === "pass_qr") {
    if (!input.profileId) throw new Error("falta el perfil");
    if (input.contentType !== "image/png") throw new Error("el pase es png");
    return { bucket: "pass-images", path: passObjectPath(input.profileId) };
  }
  if (!input.slug || !input.filename) throw new Error("falta el bloque");
  return { bucket: "content-images", path: contentObjectPath(input.slug, input.filename) };
}
