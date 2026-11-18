import { memoryRuns } from "@/lib/methodology/v2/memory-runs";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

function fromMemory() {
  const runs = memoryRuns();
  let finished = 0;
  for (const row of runs.values()) {
    if (row.finished_at !== null) finished += 1;
  }
  return { started: runs.size, finished };
}

export async function tally() {
  if (process.env.DIRECTORY === "memory") return fromMemory();

  const token = await readAccessToken();
  if (!token) throw new Error("Falta la sesión del superadmin");
  const db = createSupabaseWithAccess(token);
  const started = await db.from("methodology_v2_runs").select("profile_id", { count: "exact", head: true });
  const finished = await db
    .from("methodology_v2_runs")
    .select("profile_id", { count: "exact", head: true })
    .not("finished_at", "is", null);
  if (started.error) throw new Error(started.error.message);
  if (finished.error) throw new Error(finished.error.message);
  return { started: started.count ?? 0, finished: finished.count ?? 0 };
}
