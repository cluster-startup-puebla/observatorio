export type Role =
  | "superadmin"
  | "moderador"
  | "empresario"
  | "director"
  | "capturista"
  | "invitador";

export type Action =
  | "manage_all"
  | "desk_scan"
  | "edit_brand"
  | "upload_excel"
  | "create_invite"
  | "copy_link"
  | "view_crm"
  | "send_mass_email"
  | "answer_methodology";

const grants: Record<Role, Action[]> = {
  superadmin: [
    "manage_all",
    "desk_scan",
    "edit_brand",
    "upload_excel",
    "create_invite",
    "copy_link",
    "view_crm",
    "send_mass_email",
    "answer_methodology",
  ],
  moderador: ["desk_scan"],
  empresario: ["answer_methodology"],
  director: ["edit_brand", "upload_excel", "create_invite", "copy_link", "view_crm"],
  capturista: ["upload_excel", "create_invite", "view_crm"],
  invitador: ["create_invite", "copy_link", "view_crm"],
};

export function can(role: Role, action: Action): boolean {
  return grants[role]?.includes(action) ?? false;
}
