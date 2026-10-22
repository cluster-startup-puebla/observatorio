import { describe, expect, it } from "vitest";
import { createSupabaseDirectory } from "./supabase-directory";

describe("supabase directory", () => {
  it("encuentra la cuenta y no la invitación con el mismo correo", async () => {
    const rows = [
      { id: "org-row", email: "ana@norte.mx", role: "empresario", onboarded_at: null, org_id: "camara" },
      { id: "acc", email: "ana@norte.mx", role: "empresario", onboarded_at: null, org_id: null },
    ];
    const client = {
      from() {
        return {
          select() {
            return {
              eq(_emailColumn: string, email: string) {
                return {
                  maybeSingle: async () => ({
                    data: rows.find((row) => row.email === email && row.org_id === null) ?? null,
                  }),
                };
              },
            };
          },
        };
      },
    };
    const directory = createSupabaseDirectory(client as never);
    expect(await directory.findByEmail(" ANA@norte.mx ")).toEqual({
      id: "acc",
      role: "empresario",
      onboarded: false,
    });
  });
});
