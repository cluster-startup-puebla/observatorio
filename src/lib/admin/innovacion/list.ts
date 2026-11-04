import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { pageQuery } from "@/lib/admin/page-query";

type ConsentRow = { profile_id: string; accepted_at: string };

export async function listAcceptedInnovation(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const db = await adminDb();
  if (!db) return { page: page.page, rows: [] as Record<string, string>[] };
  const consents = await db
    .from("innovation_consents")
    .select("profile_id, accepted_at")
    .not("accepted_at", "is", null)
    .order("accepted_at", { ascending: false })
    .range(page.from, page.to);
  if (consents.error) throw new Error(consents.error.message);
  const rows = (consents.data ?? []) as ConsentRow[];
  const ids = rows.map((row) => row.profile_id);
  const people = ids.length
    ? await db.from("profiles").select("id, email, full_name").in("id", ids)
    : { data: [], error: null };
  const companies = ids.length
    ? await db.from("companies").select("id, profile_id, legal_name").in("profile_id", ids)
    : { data: [], error: null };
  if (people.error) throw new Error(people.error.message);
  if (companies.error) throw new Error(companies.error.message);
  const personById = new Map((people.data ?? []).map((row) => [row.id, row]));
  const companyByProfile = new Map((companies.data ?? []).map((row) => [row.profile_id, row]));
  return {
    page: page.page,
    rows: rows.map((row) => {
      const person = personById.get(row.profile_id);
      const company = companyByProfile.get(row.profile_id);
      return {
        id: row.profile_id,
        empresa: company?.legal_name ?? "Sin empresa",
        empresa_id: company?.id ?? "",
        nombre: person?.full_name ?? "",
        correo: person?.email ?? "",
        acepto: acceptedLabel(row.accepted_at),
      };
    }),
  };
}

function acceptedLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
}
