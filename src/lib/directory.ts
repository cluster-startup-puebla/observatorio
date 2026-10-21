export type AccountRole =
  | "empresario"
  | "director"
  | "capturista"
  | "invitador"
  | "superadmin"
  | "moderador";

export type InviteInput = { nombre: string; empresa: string; correo: string };

export type CrmPerson = {
  id: string;
  nombre: string;
  empresa: string;
  correo: string;
  status: string;
};

export interface Directory {
  createAccount(input: { email: string; role: AccountRole }): Promise<{ id: string }>;
  findByEmail(email: string): Promise<{ id: string; role: AccountRole; onboarded: boolean } | null>;
  completeOnboarding(
    id: string,
    profile: { sectorSlug: string; size: string; name?: string; logoKey?: string },
  ): Promise<void>;
  saveAnswer(input: { personId: string; questionId: string; value: string }): Promise<void>;
  answersFor(personId: string): Promise<Record<string, string>>;
  qrFor(id: string): Promise<{ personId: string } | null>;
  importInvites(orgId: string, rows: InviteInput[]): Promise<void>;
  crm(orgId: string): Promise<CrmPerson[]>;
  copyEventLink(orgId: string, sectorSlug: string): Promise<string>;
  attributeRegistration(input: { token: string; email: string }): Promise<void>;
  conversion(orgId: string, sectorSlug: string): Promise<{ copies: number; registrations: number }>;
  scanQr(id: string): Promise<
    | { ok: true; name: string; status: "llego" }
    | { ok: false; reason: string }
  >;
  sendOpenInnovation(): Promise<void>;
  outbox(): Promise<{ to: string; subject: string }[]>;
  progress(): Promise<{ personId: string; count: number }[]>;
}
