import "server-only";

import { accountErrors } from "@/lib/account-draft";
import { adminDb } from "@/lib/admin/admin-db";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { staffDraft } from "./staff-draft";

export async function createStaff(form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const draft = staffDraft({
    role: String(form.get("role") ?? ""),
    organizationId: String(form.get("organization_id") ?? ""),
  });
  if (!draft.ok) return draft;
  const errors = accountErrors({ email, password });
  if (errors) return { ok: false as const, reason: errors.email ?? errors.password ?? "datos inválidos" };
  const admin = createSupabaseAdmin();
  const created = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    return { ok: false as const, reason: created.error?.message ?? "no se creó la cuenta" };
  }
  const db = await adminDb();
  if (!db) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    return { ok: false as const, reason: "sin sesión de supabase" };
  }
  const inserted = await db.from("profiles").insert({
    id: created.data.user.id,
    role: draft.role,
    email: email.trim().toLowerCase(),
    organization_id: draft.organizationId,
  });
  if (inserted.error) {
    await admin.auth.admin.deleteUser(created.data.user.id);
    return { ok: false as const, reason: inserted.error.message };
  }
  return { ok: true as const, id: created.data.user.id };
}
