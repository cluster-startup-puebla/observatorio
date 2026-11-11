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
    <form action={uploadCompanyLogoLater} className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-h4 text-ink">Veo que no tienes logo. ¿Te gustaría subirlo ahora?</p>
        <p className="text-body text-ink-secondary">
          Durante el evento tu logo puede aparecer en las pantallas.
        </p>
      </div>
      <CompanyLogoFields
        showLogo={showLogo}
        onShow={setShowLogo}
        onFile={() => undefined}
      />
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <PendingSubmit idle="Subir logo" pendingLabel="Subiendo logo…" />
    </form>
  );
}
