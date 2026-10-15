"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "observatorio-theme";

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(STORAGE_KEY, next);
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-secondary transition hover:text-mark"
    >
      <span className="sr-only">
        <span className="dark:hidden">Modo oscuro</span>
        <span className="hidden dark:inline">Modo claro</span>
      </span>
      <Sun className="hidden dark:block" size={18} strokeWidth={1.75} aria-hidden />
      <Moon className="dark:hidden" size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
