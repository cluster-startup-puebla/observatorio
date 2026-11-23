"use client";

import { useState } from "react";
import { OnboardingSelect } from "@/components/onboarding/onboarding-select";

export function CopyLinkSession({
  sessions,
  preferredId,
}: {
  sessions: { id: string; label: string }[];
  preferredId?: string | null;
}) {
  if (sessions.length === 0) return null;
  const preferred = preferredId && sessions.some((session) => session.id === preferredId) ? preferredId : "";
  const only = sessions.length === 1 ? sessions[0].id : preferred;
  const [value, setValue] = useState(only);
  return (
    <div className="min-w-[18rem] max-w-full flex-1" data-tour="sesion">
      <OnboardingSelect
        id="session_id"
        name="session_id"
        label="Sesión"
        value={value}
        options={sessions.map((session) => ({ value: session.id, label: session.label }))}
        onChange={setValue}
      />
    </div>
  );
}
