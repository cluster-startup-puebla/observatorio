"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChallengeFormActions,
  runPublish,
} from "./challenge-form-actions";
import { ChallengeFormFields, type ChallengeFormState } from "./challenge-form-fields";
import { ChallengeVisibilityFields } from "./challenge-visibility-fields";
import { PublishConfirm } from "./publish-confirm";

export function ChallengeEditor({
  initial,
  challengeId,
  status,
  title,
  companyName,
  logoUrl,
}: {
  initial: ChallengeFormState;
  challengeId?: string;
  status?: string;
  title: string;
  companyName?: string;
  logoUrl?: string | null;
}) {
  const [value, setValue] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  const locked = status === "oculto" || status === "cerrado";
  const published = status === "publicado";

  return (
    <div className="grid w-full gap-6 px-1 pb-28 md:pb-8">
      <div>
        <p className="text-small text-ink-secondary">
          <Link href="/app/challenges" className="text-link">
            Retos
          </Link>
          {" / "}
          {challengeId ? "Editar" : "Nuevo"}
        </p>
        <h1 className="mt-1 font-display text-h2 text-ink">{title}</h1>
      </div>
      {locked ? (
        <Alert variant="destructive">
          <AlertDescription>
            Este reto está cerrado u oculto. Ya no se puede editar.
          </AlertDescription>
        </Alert>
      ) : null}
      <ChallengeFormFields value={value} onChange={setValue} disabled={locked} />
      <ChallengeVisibilityFields
        value={value}
        onChange={setValue}
        disabled={locked}
        companyName={companyName}
        logoUrl={logoUrl}
      />
      {!locked ? (
        <ChallengeFormActions
          value={value}
          challengeId={challengeId}
          published={published}
          onAskPublish={() => setConfirm(true)}
        />
      ) : null}
      <PublishConfirm
        open={confirm}
        onOpenChange={setConfirm}
        onConfirm={() => runPublish(value, challengeId)}
      />
    </div>
  );
}
