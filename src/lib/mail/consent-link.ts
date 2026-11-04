import { randomBytes } from "node:crypto";

type ConsentDb = {
  // PostgrestBuilder is thenable. Typing it as Promise rejects SupabaseClient.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
};

export function newConsentToken() {
  return randomBytes(32).toString("base64url");
}

export async function ensureConsentToken(db: ConsentDb, profileId: string, siteUrl: string | undefined) {
  const base = siteUrl?.trim().replace(/\/$/, "") ?? "";
  const id = profileId.trim();
  if (!base || !id) return null;
  const found = await db.from("innovation_consents").select("token").eq("profile_id", id).maybeSingle();
  if (found.error) return null;
  const token = found.data?.token ?? newConsentToken();
  if (!found.data) {
    const inserted = await db.from("innovation_consents").insert({ profile_id: id, token });
    if (inserted.error) return null;
  }
  return `${base}/innovacion-abierta/aceptar?t=${encodeURIComponent(token)}`;
}
