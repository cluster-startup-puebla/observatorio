export type MesaGuest = {
  name: string;
  company: string;
  sector: string;
  invitedBy: string;
};

type GuestRow = {
  full_name?: string | null;
  company_name?: string | null;
  sector_name?: string | null;
  invited_by?: string | null;
};

function text(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function mesaGuest(row: GuestRow | null): MesaGuest {
  return {
    name: text(row?.full_name),
    company: text(row?.company_name),
    sector: text(row?.sector_name),
    invitedBy: text(row?.invited_by),
  };
}

export function guestQuery(profileId: string, guest: MesaGuest) {
  const query = new URLSearchParams({ codigo: profileId, estatus: "llego" });
  if (guest.name) query.set("nombre", guest.name);
  if (guest.company) query.set("empresa", guest.company);
  if (guest.sector) query.set("sector", guest.sector);
  if (guest.invitedBy) query.set("invito", guest.invitedBy);
  return query.toString();
}
