export type TableroContact = { id: string; source: string; organizationId: string };
export type TableroStatus = { contactId: string; status: string };
export type TableroOrg = { id: string; name: string };
export type TableroEvent = { contactId: string; occurredAt: string };

export type FunnelRow = { etapa: string; personas: number; fill: string };
export type OrgBar = { organismo: string; invitaciones: number; confirmaciones: number };
export type PaceRow = { dia: string; confirmaciones: number };

export type Tablero = {
  invitations: number;
  confirmations: number;
  linkSignups: number;
  rate: number;
  funnel: FunnelRow[];
  byOrg: OrgBar[];
  pace: PaceRow[];
  pendingContact: number;
  pendingConfirm: number;
  pendingRegister: number;
  declined: number;
};
