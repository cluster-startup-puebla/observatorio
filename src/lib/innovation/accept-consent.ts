const tokenShape = /^[A-Za-z0-9_-]{43,80}$/;

export async function acceptConsent(token: string) {
  const clean = token.trim();
  if (!tokenShape.test(clean)) return "invalido" as const;
  const { createSupabaseAnon } = await import("@/lib/supabase/auth-session");
  const result = await createSupabaseAnon().rpc("accept_open_innovation", { raw_token: clean });
  if (result.error || result.data !== "aceptado") {
    if (result.error) console.error("accept_open_innovation", result.error.message);
    return "invalido" as const;
  }
  return "aceptado" as const;
}
