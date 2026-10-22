import "server-only";

import { accountErrors } from "@/lib/account-draft";
import { adminDb } from "@/lib/admin/admin-db";
import { staffCreateError } from "./staff-create-error";
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

  const db = await adminDb();
  if (!db) {
    console.error("createStaff: sin sesión de supabase");
    return { ok: false as const, reason: staffCreateError("missing") };
  }

  const created = await db.rpc("create_staff_account", {
    staff_email: email.trim().toLowerCase(),
    staff_password: password,
    staff_role: draft.role,
    staff_organization_id: draft.organizationId,
  });
  if (created.error || !created.data) {
    console.error("create_staff_account", created.error);
    return { ok: false as const, reason: staffCreateError(created.error?.message ?? "missing") };
  }
  return { ok: true as const, id: created.data as string };
}
