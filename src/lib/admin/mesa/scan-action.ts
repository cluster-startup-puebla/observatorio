"use server";

import { redirect } from "next/navigation";
import { processMesaScan } from "@/lib/admin/mesa/process-scan";
import { mesaHref } from "@/lib/admin/mesa/href";
import { requireMesa } from "@/lib/auth/guards";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  createSupabaseWithAccess,
  readAccessToken,
  usesSupabaseAuth,
} from "@/lib/supabase/auth-session";
import { scanDeskAction } from "@/lib/flow-actions";

function readCode(input: FormData | string | Record<string, unknown>) {
  if (typeof input === "string") return input.trim();
  if (input && typeof (input as FormData).get === "function") {
    return String((input as FormData).get("codigo") ?? "").trim();
  }
  if (input && typeof input === "object" && "codigo" in input) {
    return String((input as { codigo?: unknown }).codigo ?? "").trim();
  }
  return "";
}

export async function scanMesaAction(input: FormData | string) {
  const code = readCode(input);
  if (!usesSupabaseAuth()) {
    const data = new FormData();
    data.set("codigo", code);
    await scanDeskAction(data);
    return;
  }
  const account = await requireMesa();
  const token = await readAccessToken();
  if (!account || !token) redirect(`${mesaHref}?error=${encodeURIComponent("sin sesión")}`);
  if (!code) redirect(`${mesaHref}?error=${encodeURIComponent("sin lectura")}`);
  const db = createSupabaseAdmin() ?? createSupabaseWithAccess(token);
  redirect(await processMesaScan(db, account, code));
}
