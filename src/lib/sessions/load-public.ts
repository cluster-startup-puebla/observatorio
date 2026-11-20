const columns = "id, title, public_slug, session_on, venue";

export type PublicSession = {
  publicSlug: string;
  title: string;
  sessionOn: string;
  venue: string;
};

export type PublicSessionRow = {
  id: string;
  title: string;
  public_slug: string;
  session_on: string;
  venue: string | null;
};

type QueryError = { message: string } | null;
type Listed = { data: PublicSessionRow[] | null; error: QueryError };
type One = { data: PublicSessionRow | null; error: QueryError };

export type PublicSessionsDb = {
  from(table: string): {
    select(columns: string): {
      order(column: string, options: { ascending: boolean }): PromiseLike<Listed>;
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<One>;
      };
    };
  };
};

export function toPublicSession(row: PublicSessionRow): PublicSession {
  return {
    publicSlug: row.public_slug,
    title: row.title,
    sessionOn: row.session_on,
    venue: row.venue ?? "",
  };
}

function readError(error: QueryError) {
  if (error) throw new Error(error.message);
}

async function sessionsDb(client?: PublicSessionsDb) {
  if (client) return client;
  const { createSupabaseAnon } = await import("@/lib/supabase/auth-session");
  return createSupabaseAnon() as unknown as PublicSessionsDb;
}

export async function listPublicSessions(client?: PublicSessionsDb) {
  const db = await sessionsDb(client);
  const result = await db.from("sessions").select(columns).order("session_on", { ascending: false });
  readError(result.error);
  return (result.data ?? []).map(toPublicSession);
}

export async function sessionBySlug(publicSlug: string, client?: PublicSessionsDb) {
  const db = await sessionsDb(client);
  const result = await db.from("sessions").select(columns).eq("public_slug", publicSlug).maybeSingle();
  readError(result.error);
  return result.data ? toPublicSession(result.data) : null;
}
