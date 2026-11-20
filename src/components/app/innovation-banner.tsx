"use client";

import { ChevronRight } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AppCard } from "@/components/app/app-card";
import { FinishConfetti } from "@/components/methodology/v2/finish-confetti";
import { joinOpenInnovation } from "@/lib/app/join-open-innovation";

export function InnovationBanner({ show }: { show: boolean }) {
  const [pending, start] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  if (!show && !celebrate) return null;

  function join() {
    start(async () => {
      const error = await joinOpenInnovation();
      if (error) {
        toast.error(error);
        return;
      }
      setCelebrate(true);
      toast.success("Ya quedaste como empresa de innovación abierta.");
    });
  }

  return (
    <>
      {celebrate ? <FinishConfetti /> : null}
      {show && !celebrate ? (
        <AppCard className="border-0 bg-brand text-on-brand shadow-none">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-small text-on-brand/80">Innovación abierta</p>
              <p className="mt-1 text-body leading-snug">
                ¿Quieres convertirte en una empresa de innovación abierta?
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-small font-semibold text-on-brand disabled:opacity-60"
              disabled={pending}
              onClick={join}
            >
              {pending ? "Uniendo…" : "Unirme"}
              {pending ? null : <ChevronRight aria-hidden className="size-4" />}
            </button>
          </div>
        </AppCard>
      ) : null}
    </>
  );
}
