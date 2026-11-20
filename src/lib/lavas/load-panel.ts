import "server-only";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";
import { loadLavaBalance } from "./load-balance";
import { loadLavaCatalog, type LavaCatalogRow } from "./load-catalog";
import { loadLavaLedger } from "./load-ledger";

export type LavaPanel = {
  balance: number;
  catalog: LavaCatalogRow[];
  boost: { multiplier: number; flatBonus: number };
  history: Awaited<ReturnType<typeof loadLavaLedger>>;
};

export const emptyLavaPanel: LavaPanel = {
  balance: 0,
  catalog: [],
  boost: { multiplier: 1, flatBonus: 0 },
  history: [],
};

export async function loadLavaPanel(accessToken: string, companyId: string): Promise<LavaPanel> {
  const db = createSupabaseWithAccess(accessToken);
  const [balance, catalog, history, boostRow] = await Promise.all([
    loadLavaBalance(accessToken, companyId),
    loadLavaCatalog(accessToken),
    loadLavaLedger(accessToken, companyId),
    db.from("lava_boost_config").select("multiplier, flat_bonus").eq("id", 1).maybeSingle(),
  ]);
  return {
    balance,
    catalog,
    history,
    boost: {
      multiplier: Number(boostRow.data?.multiplier ?? 1),
      flatBonus: Number(boostRow.data?.flat_bonus ?? 0),
    },
  };
}
