import { eventPath } from "@/lib/admin/organismos/brand";
import { createdLabel } from "@/lib/admin/organismos/created-label";
import { foldLinks } from "@/lib/admin/organismos/fold-links";
import { currentOption } from "@/lib/sessions/face";

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
  sectors: { id: string; name: string | null; slug: string | null } | { id: string; name: string | null; slug: string | null }[] | null;
  sessions: SessionEmbed | SessionEmbed[] | null;
};

export type BuiltLink = {
  id: string;
  sectorId: string;
  sector: string;
  session: string;
  created: string;
  path: string;
};

export type OrganismoLink = Omit<BuiltLink, "created"> & {
  times: number;
  dates: string[];
};

function one<T>(value: T | T[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function linkRow(input: {
  id: string;
  createdAt: string;
  sectorId: string;
  sectorName: string;
  sectorSlug: string;
  sessionLabel: string;
  token: string;
  sessionId: string | null;
}) {
  return {
    id: input.id,
    sectorId: input.sectorId,
    sector: input.sectorName,
    session: input.sessionLabel,
    created: createdLabel(input.createdAt),
    path: input.sectorSlug ? eventPath(input.sectorSlug, input.token, input.sessionId) : "",
  };
}

export function linksFromCopies(rows: CopyRecord[], token: string): OrganismoLink[] {
  return foldLinks(
    rows.map((row) => {
      const sector = one(row.sectors);
      const session = one(row.sessions);
      return linkRow({
        id: row.id,
        createdAt: row.created_at,
        sectorId: sector?.id ?? "",
        sectorName: sector?.name?.trim() || "Sector desconocido",
        sectorSlug: sector?.slug ?? "",
        sessionLabel: session ? currentOption(session).label : "Sin sesión",
        token,
        sessionId: row.session_id,
      });
    }),
  );
}
