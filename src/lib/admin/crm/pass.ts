import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type ContactPass = { assetId: string; arrivedAt: string };

export async function loadContactPass(db: SupabaseClient, profileId: string): Promise<ContactPass | null> {
  if (!profileId) return null;
  const pass = await db.from("passes").select("image_asset_id").eq("profile_id", profileId).maybeSingle();
  if (pass.error) throw new Error(pass.error.message);
  if (!pass.data) return null;
  const arrival = await db.from("arrivals").select("scanned_at").eq("profile_id", profileId).maybeSingle();
  if (arrival.error) throw new Error(arrival.error.message);
  return { assetId: pass.data.image_asset_id, arrivedAt: arrival.data?.scanned_at ?? "" };
}
