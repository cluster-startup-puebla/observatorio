"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "observatorio-theme";

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(STORAGE_KEY, next);
}

export function ThemeToggle({ onField = false }: { onField?: boolean }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex size-11 items-center justify-center rounded-full border transition ${
        onField
          ? "border-white/40 text-white hover:border-white hover:bg-white/10"
          : "border-line text-ink-secondary hover:text-mark"
      }`}
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
