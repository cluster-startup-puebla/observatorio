import { passWhen } from "@/lib/admin/pases/pass-face";

export type PassListRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  sector: string;
  sector_id: string;
  session: string;
  cuenta: string;
  issued_at: string;
  issued_label: string;
  llegada: string;
  kind: "rsvp" | "legacy";
  profile_id: string;
};

export function passListRow(input: {
  id: string;
  name: string;
  email: string;
  company: string;
  sector: string;
  sectorId: string;
  session: string;
  profileId: string;
  issuedAt: string;
  arrivedAt: string;
  kind: "rsvp" | "legacy";
}): PassListRow {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    company: input.company,
    sector: input.sector,
    sector_id: input.sectorId,
    session: input.session,
    cuenta: input.profileId ? "Con cuenta" : "Sin cuenta",
    issued_at: input.issuedAt,
    issued_label: passWhen(input.issuedAt) || "—",
    llegada: input.arrivedAt ? passWhen(input.arrivedAt) : "Sin escanear",
    kind: input.kind,
    profile_id: input.profileId,
  };
}
