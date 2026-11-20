import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("award_lavas rpc", () => {
  it("calcula boost EIA e inserta idempotente", () => {
    const sql = readFileSync("supabase/migrations/20261120030300_award_lavas_rpc.sql", "utf8");
    expect(sql).toContain("function public.award_lavas(");
    expect(sql).toContain("innovation_consents");
    expect(sql).toContain("accepted_at is not null");
    expect(sql).toContain("on conflict (company_id, action_code, ref_key) do nothing");
    expect(sql).toContain(
      "grant execute on function public.award_lavas(uuid, text, text, text, text, integer) to authenticated",
    );
    expect(sql).toContain("revoke all on function public.award_lavas(uuid, text, text, text, text, integer) from public, anon");
  });
});
