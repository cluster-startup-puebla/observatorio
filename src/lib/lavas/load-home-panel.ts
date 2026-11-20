import "server-only";
import { readAccessToken } from "@/lib/supabase/auth-session";
import { emptyLavaPanel, loadLavaPanel, type LavaPanel } from "./load-panel";

export async function loadHomeLavaPanel(companyId: string | null): Promise<LavaPanel> {
  if (!companyId) return emptyLavaPanel;
  const token = await readAccessToken();
  if (!token) return emptyLavaPanel;
  return loadLavaPanel(token, companyId);
}
