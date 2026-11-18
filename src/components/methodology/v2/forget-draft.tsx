"use client";

import { useEffect } from "react";
import { draftKey } from "@/lib/methodology/v2/draft";

export function ForgetDraft({ profileId }: { profileId: string }) {
  useEffect(() => {
    localStorage.removeItem(draftKey(profileId));
  }, [profileId]);

  return null;
}
