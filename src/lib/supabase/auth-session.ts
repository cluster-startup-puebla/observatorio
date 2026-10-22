import "server-only";

import { createClient, type Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const accessCookie = "sb-access-token";
const refreshCookie = "sb-refresh-token";

export function usesSupabaseAuth() {
  if (process.env.AUTH_PROVIDER === "memory") return false;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Faltan las llaves públicas de Supabase");
  return { url, key };
}

export function createSupabaseAnon() {
  const { url, key } = publicEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createSupabaseWithAccess(accessToken: string) {
  const { url, key } = publicEnv();
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function writeSupabaseSession(session: Session) {
  const jar = await cookies();
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
  jar.set(accessCookie, session.access_token, { ...base, maxAge: session.expires_in });
  jar.set(refreshCookie, session.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export async function readAccessToken() {
  return (await cookies()).get(accessCookie)?.value ?? null;
}

export async function clearSupabaseSession() {
  const jar = await cookies();
  jar.delete(accessCookie);
  jar.delete(refreshCookie);
}

export async function superadminExists() {
  const { data, error } = await createSupabaseAnon().rpc("superadmin_exists");
  if (error) throw new Error(error.message);
  return Boolean(data);
}
