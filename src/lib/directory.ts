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
  superadminCount(): Promise<number>;
  createFirstSuperadmin(input: {
    email: string;
    password: string;
  }): Promise<{ ok: true; id: string } | { ok: false; reason: "ya existe" }>;
  loginSuperadmin(input: {
    email: string;
    password: string;
  }): Promise<{ ok: true; id: string } | { ok: false; reason: "credenciales" }>;
  loginAccount(input: {
    email: string;
    password: string;
  }): Promise<
    { ok: true; id: string; role: AccountRole } | { ok: false; reason: "credenciales" }
  >;
  findByEmail(email: string): Promise<{ id: string; role: AccountRole; onboarded: boolean } | null>;
  completeOnboarding(
    id: string,
    profile: {
      sectorSlug: string;
      size: string;
      name?: string;
      logoKey?: string;
      slug?: string;
      jobTitle?: string;
      whatsapp?: string;
      companyName?: string;
      marketSize?: string;
      municipality?: string;
      referralSource?: string;
      sessionInterest?: string;
      email?: string;
    },
  ): Promise<void>;
  saveAnswer(input: { personId: string; questionId: string; value: string }): Promise<void>;
  answersFor(personId: string): Promise<Record<string, string>>;
  qrFor(id: string): Promise<{ personId: string } | null>;
  importInvites(orgId: string, rows: InviteInput[]): Promise<void>;
  crm(orgId: string): Promise<CrmPerson[]>;
  applyCrm(
    personId: string,
    event: "contactar" | "rechazar",
  ): Promise<{ ok: true; status: "contactado" | "no" } | { ok: false; reason: string }>;
  copyEventLink(orgId: string, sectorSlug: string): Promise<string>;
  brandForToken(token: string): Promise<{ name: string; logoKey: string } | null>;
  sectorMessage(slug: string): Promise<{ headline: string; body: string } | null>;
  attributeRegistration(input: { token: string; email: string; sectorSlug?: string }): Promise<void>;
  conversion(orgId: string, sectorSlug: string): Promise<{ copies: number; registrations: number }>;
  recordOpen(input: { token: string; sectorSlug: string; at: string }): Promise<void>;
  opensFor(orgId: string): Promise<{ at: string; sectorSlug: string }[]>;
  scanQr(id: string): Promise<
    | { ok: true; name: string; status: "llego" }
    | { ok: false; reason: string }
  >;
  sendOpenInnovation(): Promise<void>;
  outbox(): Promise<{ to: string; subject: string }[]>;
  progress(): Promise<{ personId: string; count: number }[]>;
  getAccount(id: string): Promise<{
    id: string;
    email: string;
    role: AccountRole;
    onboarded: boolean;
    sectorSlug?: string;
    name?: string;
    logoKey?: string;
    orgSlug?: string;
  } | null>;
}
