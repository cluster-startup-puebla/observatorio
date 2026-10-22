import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { openRef } from "@/lib/ref-token";

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Faltan las llaves públicas de Supabase");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function recordLinkOpen(input: { token: string; sectorSlug: string; at: string }) {
  const orgId = openRef(input.token, refSecret());
  if (!orgId) return;
  await anonClient().rpc("record_link_open", {
    org_id: orgId,
    sector_slug: input.sectorSlug,
  });
}

export async function opensForOrganization(client: SupabaseClient, orgId: string) {
  const { data, error } = await client
    .from("link_opens")
    .select("opened_at")
    .eq("organization_id", orgId)
    .order("opened_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ at: row.opened_at as string }));
}
