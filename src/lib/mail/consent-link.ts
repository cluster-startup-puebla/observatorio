import { randomBytes } from "node:crypto";

type ConsentDb = {
  from(table: "innovation_consents"): {
    select(columns: "token"): {
      eq(column: "profile_id", value: string): {
        maybeSingle(): Promise<{ data: { token: string } | null; error: { message: string } | null }>;
      };
    };
    insert(row: { profile_id: string; token: string }): Promise<{ error: { message: string } | null }>;
  };
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
