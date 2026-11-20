"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishChallenge } from "@/lib/app/challenges/publish-challenge";
import { saveChallengeDraft } from "@/lib/app/challenges/save-draft";
import { updatePublishedChallenge } from "@/lib/app/challenges/update-published";
import type { ChallengeFormState } from "./challenge-form-fields";

export function ChallengeFormActions({
  value,
  challengeId,
  published,
  onDone,
  onAskPublish,
}: {
  value: ChallengeFormState;
  challengeId?: string;
  published: boolean;
  onDone: () => void;
  onAskPublish: () => void;
}) {
  async function saveDraft() {
    const error = await saveChallengeDraft({ ...value, id: challengeId });
    if (error) toast.error(error);
    else {
      toast.success("Borrador guardado.");
      onDone();
    }
  }

  async function savePublished() {
    const error = await updatePublishedChallenge({ ...value, id: challengeId });
    if (error) toast.error(error);
    else {
      toast.success("Reto actualizado.");
      onDone();
    }
  }

  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-2">
      {published ? (
        <Button type="button" onClick={savePublished}>
          Guardar cambios
        </Button>
      ) : (
        <>
          <Button type="button" variant="outline" onClick={saveDraft}>
            Guardar borrador
          </Button>
          <Button type="button" onClick={onAskPublish}>
            Publicar
          </Button>
        </>
      )}
    </div>
  );
}

export async function runPublish(
  value: ChallengeFormState,
  challengeId: string | undefined,
  onDone: () => void,
) {
  const error = await publishChallenge({ ...value, id: challengeId });
  if (error) toast.error(error);
  else {
    toast.success("Reto publicado.");
    onDone();
  }
}
