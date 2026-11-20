import { notFound } from "next/navigation";
import { ChallengeEditor } from "@/components/app/challenges/challenge-editor";
import { formFromRow } from "@/components/app/challenges/challenge-defaults";
import { loadIdentity } from "@/lib/app/load-identity";
import { loadOneChallenge } from "@/lib/app/challenges/load-one";

export const instant = false;

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, identity] = await Promise.all([
    loadOneChallenge(id),
    loadIdentity(),
  ]);
  if (!row) notFound();
  return (
    <ChallengeEditor
      title={row.name || "Editar reto"}
      challengeId={row.id}
      status={row.status}
      initial={formFromRow(row)}
      companyName={identity.company}
      logoUrl={identity.logoUrl}
    />
  );
}
