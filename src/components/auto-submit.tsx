"use client";

import { useEffect, useState } from "react";

export function AutoSubmit({ selector, readyTestId }: { selector: string; readyTestId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches(selector)) return;
      input.form?.requestSubmit();
    };
    document.addEventListener("change", onChange);
    setReady(true);
    return () => document.removeEventListener("change", onChange);
  }, [selector]);

  return ready ? <span data-testid={readyTestId} hidden /> : null;
}
