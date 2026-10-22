"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function LoginNotice({ notice }: { notice?: string }) {
  useEffect(() => {
    if (notice) toast(notice);
  }, [notice]);
  return null;
}
