/** Pase visible / correo: empresa verificada o CRM ya en lista. */
export function sessionPassAllowed(input: {
  admittedAt: string | null | undefined;
  crmStatuses: readonly (string | null | undefined)[];
}) {
  if (input.admittedAt) return true;
  return input.crmStatuses.some(
    (status) => status === "confirmo" || status === "registrado" || status === "llego",
  );
}
