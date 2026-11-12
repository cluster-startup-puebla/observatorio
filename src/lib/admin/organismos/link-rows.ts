import { eventPath } from "@/lib/admin/organismos/brand";
import { currentOption } from "@/lib/sessions/face";

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

type SessionEmbed = {
  venue: string;
  session_on: string;
  starts_local: string;
  ends_local: string;
};

export type CopyRecord = {
  id: string;
  created_at: string;
  session_id: string | null;
  sectors: { name: string | null; slug: string | null } | { name: string | null; slug: string | null }[] | null;
  sessions: SessionEmbed | SessionEmbed[] | null;
};

export type OrganismoLink = {
  id: string;
  sector: string;
  session: string;
  created: string;
  path: string;
};

function one<T>(value: T | T[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function createdLabel(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const month = months[Number(match[2]) - 1];
  if (!month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

export function linkRow(input: {
  id: string;
  createdAt: string;
  sectorName: string;
  sectorSlug: string;
  sessionLabel: string;
  token: string;
  sessionId: string | null;
}) {
  return {
    id: input.id,
    sector: input.sectorName,
    session: input.sessionLabel,
    created: createdLabel(input.createdAt),
    path: input.sectorSlug ? eventPath(input.sectorSlug, input.token, input.sessionId) : "",
  };
}

export function linksFromCopies(rows: CopyRecord[], token: string): OrganismoLink[] {
  return rows.map((row) => {
    const sector = one(row.sectors);
    const session = one(row.sessions);
    return linkRow({
      id: row.id,
      createdAt: row.created_at,
      sectorName: sector?.name?.trim() || "Sector desconocido",
      sectorSlug: sector?.slug ?? "",
      sessionLabel: session ? currentOption(session).label : "Sin sesión",
      token,
      sessionId: row.session_id,
    });
  });
}
