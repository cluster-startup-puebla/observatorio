"use client";

import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChallengeFormActions,
  runPublish,
} from "./challenge-form-actions";
import { ChallengeFormFields, type ChallengeFormState } from "./challenge-form-fields";
import { ChallengeVisibilityFields } from "./challenge-visibility-fields";
import { PublishConfirm } from "./publish-confirm";
import { useState } from "react";

export function ChallengeEditor({
  initial,
  challengeId,
  status,
  title,
}: {
  initial: ChallengeFormState;
  challengeId?: string;
  status?: string;
  title: string;
}) {
  const [value, setValue] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  const locked = status === "oculto";
  const published = status === "publicado";

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 pb-28 md:pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
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
      </div>
      {locked ? (
        <Alert variant="destructive">
          <AlertDescription>
            Este reto está oculto. No se puede editar; la moderación o el soft
            delete lo bajaron del portal.
          </AlertDescription>
        </Alert>
      ) : null}
      <ChallengeFormFields value={value} onChange={setValue} disabled={locked} />
      <ChallengeVisibilityFields value={value} onChange={setValue} disabled={locked} />
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
