"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChallengeFormActions,
  runPublish,
} from "./challenge-form-actions";
import { ChallengeFormFields, type ChallengeFormState } from "./challenge-form-fields";
import { ChallengeVisibilityFields } from "./challenge-visibility-fields";
import { PublishConfirm } from "./publish-confirm";

export function ChallengeForm({
  open,
  onOpenChange,
  initial,
  challengeId,
  status,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ChallengeFormState;
  challengeId?: string;
  status?: string;
}) {
  const [value, setValue] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  const locked = status === "oculto";
  const published = status === "publicado";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader className="border-b border-line pr-10">
          <SheetTitle className="font-display text-h3 text-ink">Reto</SheetTitle>
          <SheetDescription className="text-small text-ink-secondary">
            {challengeId ? "Editar reto" : "Nuevo reto"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {locked ? (
            <Alert variant="destructive">
              <AlertDescription>
                Este reto está oculto por moderación. No puedes editarlo.
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
              onDone={() => onOpenChange(false)}
              onAskPublish={() => setConfirm(true)}
            />
          ) : null}
        </div>
        <PublishConfirm
          open={confirm}
          onOpenChange={setConfirm}
          onConfirm={() => runPublish(value, challengeId, () => onOpenChange(false))}
        />
      </SheetContent>
    </Sheet>
  );
}
