import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  listPublicSessions,
  sessionBySlug,
  toPublicSession,
  type PublicSessionRow,
  type PublicSessionsDb,
} from "./load-public";

const row: PublicSessionRow = {
  id: "1",
  title: "Arranque Puebla x Puebla",
  public_slug: "18-11-26-arranque-puebla-x-puebla",
  session_on: "2026-11-18",
  venue: "Quinta Real, Puebla",
};

const older: PublicSessionRow = {
  ...row,
  id: "2",
  title: "Antes",
  public_slug: "01-01-26-antes",
  session_on: "2026-01-01",
};

function client(rows: PublicSessionRow[]): PublicSessionsDb {
  return {
    from(table) {
      if (table !== "sessions") throw new Error(table);
      return {
        select(query) {
          if (query !== "id, title, public_slug, session_on, venue") throw new Error(query);
          return {
            order(column, options) {
              if (column !== "session_on" || options.ascending !== false) throw new Error("order");
              return Promise.resolve({ data: rows, error: null });
            },
            eq(column, value) {
              if (column !== "public_slug") throw new Error(column);
              const found = rows.find((item) => item.public_slug === value) ?? null;
              return { maybeSingle: () => Promise.resolve({ data: found, error: null }) };
            },
          };
        },
      };
    },
  };
}

describe("carga pública de sesiones", () => {
  it("mapea la fila al contrato público", () => {
    expect(toPublicSession(row)).toEqual({
      publicSlug: row.public_slug,
      title: row.title,
      sessionOn: row.session_on,
      venue: row.venue,
    });
    expect(toPublicSession({ ...row, venue: null }).venue).toBe("");
  });

  it("lista con un doble, sin pegarle a Supabase", async () => {
    const sessions = await listPublicSessions(client([row, older]));
    expect(sessions.map((item) => item.title)).toEqual([row.title, older.title]);
    expect(sessions[0]).toEqual(toPublicSession(row));
  });

  it("sessionBySlug devuelve null si el slug no está", async () => {
    const db = client([row]);
    expect(await sessionBySlug("no-existe", db)).toBeNull();
    expect(await sessionBySlug(row.public_slug, db)).toEqual(toPublicSession(row));
  });

  it("la lectura real usa el cliente anónimo", () => {
    const source = readFileSync("src/lib/sessions/load-public.ts", "utf8");
    expect(source).toContain("createSupabaseAnon");
    expect(source).toContain('.from("sessions")');
    expect(source).toContain('.order("session_on", { ascending: false })');
  });
});
