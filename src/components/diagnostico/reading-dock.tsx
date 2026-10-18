"use client";

import { useLayoutEffect, useState } from "react";
import { BookOpen } from "lucide-react";

const STORAGE_KEY = "observatorio-reading";
const CHANGE_EVENT = "observatorio-reading-change";

export function setReadingMode(on: boolean) {
  document.documentElement.dataset.reading = on ? "on" : "off";
  localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useReadingMode() {
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) === "on";
    if (document.documentElement.dataset.reading !== (stored ? "on" : "off")) {
      document.documentElement.dataset.reading = stored ? "on" : "off";
    }
    setOn(document.documentElement.dataset.reading === "on");
    const sync = () => setOn(document.documentElement.dataset.reading === "on");
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  return on;
}

export function ReadingToggle({ prominent = false }: { prominent?: boolean }) {
  const on = useReadingMode();

  if (prominent) {
    return (
      <button
        type="button"
        className="btn btn-secondary w-full sm:w-auto"
        aria-pressed={on}
        onClick={() => setReadingMode(!on)}
      >
        <BookOpen size={18} strokeWidth={1.75} aria-hidden />
        Modo lectura
      </button>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-secondary transition hover:text-mark"
      aria-pressed={on}
      aria-label={on ? "Cerrar modo lectura" : "Modo lectura"}
      onClick={() => setReadingMode(!on)}
    >
      <BookOpen size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

export function ReadingDock({
  sections,
}: {
  sections: { href: string; label: string }[];
}) {
  const on = useReadingMode();

  useLayoutEffect(() => {
    return () => {
      document.documentElement.dataset.reading = "off";
      window.dispatchEvent(new Event(CHANGE_EVENT));
    };
  }, []);

  if (!on) return null;

  function jumpTo(href: string) {
    if (!href) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(href)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  const progress = readingProgress();

  return (
    <div className="reading-dock reading-dock-on">
      <ReadingProgress progress={progress} />
      <div className="reading-dock-bar">
        <button type="button" className="reading-toggle" aria-pressed onClick={() => setReadingMode(false)}>
          <BookOpen size={18} strokeWidth={1.75} aria-hidden />
          Cerrar lectura
        </button>
        <label className="reading-jump">
          <span className="sr-only">Ir a una sección</span>
          <select
            defaultValue=""
            onChange={(event) => {
              jumpTo(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Ir a una sección</option>
            {sections.map((section) => (
              <option key={section.href} value={section.href}>
                {section.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function readingProgress() {
  if (typeof window === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

function ReadingProgress({ progress }: { progress: number }) {
  const [value, setValue] = useState(progress);

  useLayoutEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setValue(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="reading-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label="Avance de lectura"
    >
      <span style={{ width: `${value * 100}%` }} />
    </div>
  );
}
