"use client";

import { useState } from "react";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { CompanyLogoFields } from "@/components/onboarding/company-logo-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadCompanyLogoLater } from "@/lib/onboarding/upload-company-logo-later";
import { serverIssue } from "@/lib/onboarding/step-issue";

export function LaterLogoForm({ error }: { error?: string }) {
  const [showLogo, setShowLogo] = useState(false);
  const notice = serverIssue(error);

  return (
    <form action={uploadCompanyLogoLater}>
      <details className="rounded-2xl border border-line px-4 py-3" open={notice ? true : undefined}>
        <summary className="cursor-pointer text-sm font-medium text-ink">Agregar el logo de tu empresa</summary>
        <div className="grid gap-4 pt-3">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-ink">Veo que no tienes logo. ¿Te gustaría subirlo ahora?</p>
            <p className="text-sm text-ink-secondary">Durante el evento tu logo puede aparecer en las pantallas.</p>
          </div>
          <CompanyLogoFields showLogo={showLogo} onShow={setShowLogo} onFile={() => undefined} />
          {notice ? (
            <Alert variant="destructive">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          ) : null}
          <PendingSubmit idle="Subir logo" pendingLabel="Subiendo logo…" />
        </div>
      </details>
    </form>
  );
}
