import "server-only";

import { readLogoFile } from "@/lib/admin/organismos/logo-file";
import { companyLogoObjectPath } from "@/lib/storage-assets";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { logoUploadDecision } from "./company-logo";

type Access = ReturnType<typeof createSupabaseWithAccess>;

function failed(show: boolean) {
  return show ? { ok: false as const, reason: "logo" as const } : { ok: true as const, show: false };
}

async function writeRow(db: Access, profileId: string, path: string, contentType: string, byteSize: number) {
  const row = {
    purpose: "company_logo",
    bucket_id: "company-logos",
    object_path: path,
    content_type: contentType,
    byte_size: byteSize,
    profile_id: profileId,
    uploaded_by: profileId,
  };
  const existing = await db
    .from("media_assets")
    .select("id")
    .eq("profile_id", profileId)
    .eq("purpose", "company_logo")
    .maybeSingle();
  const saved = existing.data
    ? await db.from("media_assets").update(row).eq("id", existing.data.id)
    : await db.from("media_assets").insert(row);
  return !saved.error;
}

export async function saveCompanyLogo(input: {
  accessToken: string;
  profileId: string;
  file: FormDataEntryValue | null;
  show: boolean;
}) {
  const hasFile = input.file instanceof File && input.file.size > 0;
  const decision = logoUploadDecision({ show: input.show, hasFile });
  if (decision.action === "skip") return { ok: true as const, show: false };
  if (decision.action !== "store") return { ok: false as const, reason: "logo" as const };
  const show = decision.show;

  const logo = await readLogoFile(input.file);
  if (!logo || "error" in logo) return failed(show);

  const path = companyLogoObjectPath(input.profileId, logo.contentType);
  const db = createSupabaseWithAccess(input.accessToken);
  const uploaded = await db.storage.from("company-logos").upload(path, logo.bytes, {
    upsert: true,
    contentType: logo.contentType,
  });
  if (uploaded.error) return failed(show);
  const saved = await writeRow(db, input.profileId, path, logo.contentType, logo.bytes.byteLength);
  if (!saved) return failed(show);
  return { ok: true as const, show };
}
