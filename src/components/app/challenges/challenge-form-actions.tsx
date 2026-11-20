"use client";

import { useRouter } from "next/navigation";
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
  onAskPublish,
}: {
  value: ChallengeFormState;
  challengeId?: string;
  published: boolean;
  onAskPublish: () => void;
}) {
  const router = useRouter();

  async function saveDraft() {
    const result = await saveChallengeDraft({ ...value, id: challengeId });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Borrador guardado.");
    router.push(`/app/challenges/${result.id}/edit`);
    router.refresh();
  }

  async function savePublished() {
    const error = await updatePublishedChallenge({ ...value, id: challengeId });
    if (error) toast.error(error);
    else {
      toast.success("Reto actualizado.");
      router.push("/app/challenges");
      router.refresh();
    }
  }

  return (
    <div className="sticky bottom-24 z-10 flex flex-wrap gap-2 border-t border-line bg-elevated/95 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:py-0 md:backdrop-blur-none">
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
) {
  const error = await publishChallenge({ ...value, id: challengeId });
  if (error) {
    toast.error(error);
    return;
  }
  toast.success("Reto publicado.");
  window.location.assign("/app/challenges");
}
