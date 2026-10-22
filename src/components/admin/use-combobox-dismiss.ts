"use client";

import { type RefObject, useEffect } from "react";

export function useComboboxDismiss(
  rootRef: RefObject<HTMLElement | null>,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [rootRef, setOpen]);
}
