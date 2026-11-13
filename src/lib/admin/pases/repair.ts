import "server-only";

import { writePass } from "@/lib/onboarding/write-pass";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

function ids(data: unknown) {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "list_missing_passes" in item) {
      return [String((item as { list_missing_passes: unknown }).list_missing_passes)];
    }
    return [];
  });
}

export async function repairMissingPasses(accessToken: string) {
  const db = createSupabaseWithAccess(accessToken);
  const listed = await db.rpc("list_missing_passes");
  if (listed.error) return { ok: false as const, written: 0 };
  let written = 0;
  for (const id of ids(listed.data)) {
    const saved = await writePass(db, id);
    if (saved.ok) written += 1;
  }
  return { ok: true as const, written };
}
