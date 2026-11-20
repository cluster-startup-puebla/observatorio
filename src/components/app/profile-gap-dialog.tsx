"use client";

import { ChevronRight } from "lucide-react";
import { ProfileGapForm } from "@/components/app/profile-gap-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProfileGap } from "@/lib/home/profile-gaps";

const copy = {
  logo: { title: "Sube el logo", description: "PNG, JPG o WEBP · hasta 2 MB." },
  website: { title: "Agrega el sitio web", description: "Escríbelo como ejemplo.com o con https." },
  verify: { title: "Verifica tu cuenta", description: "Te enviamos un enlace para confirmar el correo." },
} as const;

export function ProfileGapDialog({ gap, email }: { gap: ProfileGap; email: string }) {
  const text = copy[gap.id];
  const description = gap.id === "verify" && email ? `Enviaremos un enlace a ${email}.` : text.description;

  return (
    <Dialog>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-small font-semibold text-on-brand">
        Continuar
        <ChevronRight aria-hidden className="size-4" />
      </DialogTrigger>
      <DialogContent className="rounded-[1.75rem] p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-h4 text-ink">{text.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProfileGapForm gap={gap} email={email} />
      </DialogContent>
    </Dialog>
  );
}
