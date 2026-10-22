export function inviteLine(sector: string, orgName?: string | null) {
  if (!orgName) return `Empresa del sector ${sector}.`;
  return `Empresa del sector ${sector}, reciba una cordial invitación de ${orgName} para participar en el levantamiento de necesidades.`;
}
