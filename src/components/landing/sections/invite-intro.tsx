export function inviteLine(sector: string, orgName?: string | null) {
  if (!orgName) return `Empresa del sector ${sector}.`;
  return `Empresa del sector ${sector}, reciba una cordial invitación de ${orgName} para participar en el levantamiento de necesidades.`;
}

export function SectorInviteTitle({ sector, orgName }: { sector: string; orgName?: string | null }) {
  const name = <span className="text-brand">{sector}</span>;
  if (!orgName) return <>Empresa del sector {name}.</>;
  return (
    <>
      Empresa del sector {name}, reciba una cordial invitación de {orgName} para participar en el
      levantamiento de necesidades.
    </>
  );
}
