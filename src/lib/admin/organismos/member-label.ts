const labels: Record<string, string> = {
  director: "Director",
  capturista: "Capturista",
  invitador: "Invitador",
};

export function memberRoleLabel(role: string) {
  return labels[role] ?? role;
}
