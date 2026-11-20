import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { Identity } from "@/lib/app/identity";
import { readSessionAccount } from "@/lib/auth/session-account";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

const empty: Identity = {
  name: "",
  job: "",
  email: "",
  whatsapp: "",
  company: "",
  logoUrl: null,
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function identityTag(userId: string) {
  return `identity-${userId}`;
}

export async function loadIdentity(): Promise<Identity> {
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (!account || !token) return empty;
  return readIdentity(account.id, token, account.email);
}

async function readIdentity(userId: string, token: string, fallbackEmail: string): Promise<Identity> {
  "use cache";
  cacheLife("hours");
  cacheTag(identityTag(userId));
  const db = createSupabaseWithAccess(token);
  const [profile, company, logo] = await Promise.all([
    db.from("profiles").select("full_name, job_title, whatsapp, email").eq("id", userId).maybeSingle(),
    db.from("companies").select("legal_name").eq("profile_id", userId).maybeSingle(),
    db.from("media_assets").select("object_path").eq("profile_id", userId).eq("purpose", "company_logo").maybeSingle(),
  ]);
  const path = text(logo.data?.object_path);
  const signed = path ? await db.storage.from("company-logos").createSignedUrl(path, 60 * 60 * 24) : null;
  return {
    name: text(profile.data?.full_name),
    job: text(profile.data?.job_title),
    email: text(profile.data?.email) || fallbackEmail,
    whatsapp: text(profile.data?.whatsapp),
    company: text(company.data?.legal_name),
    logoUrl: signed?.data?.signedUrl ?? null,
  };
}
