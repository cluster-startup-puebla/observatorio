import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";
import { kindLabel } from "./kind-label";
import { mailKind } from "./kinds";

const kinds = ["password", "event_pass", "open_innovation"] as const;

export async function listBandeja(rawPage: string | undefined, rawKind: string | undefined) {
  const page = pageQuery(rawPage);
  const kind = mailKind(rawKind);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  let query = db
    .from("outbox_messages")
    .select("id, kind, to_email, subject, created_at")
    .order("created_at", { ascending: false })
    .range(page.from, page.to);
  if (kind && kinds.includes(kind)) query = query.eq("kind", kind);
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return {
    page: page.page,
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      kind: row.kind,
      kind_label: kindLabel(row.kind),
      to_email: row.to_email,
      subject: row.subject,
      created_at: row.created_at,
    })),
  };
}
