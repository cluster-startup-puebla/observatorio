import { isSessionZone, type SessionZone } from "@/lib/sessions/face";

export type ScheduleFields = {
  session_on: string;
  starts_local: string;
  ends_local: string;
  time_zone: SessionZone;
};

function realDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function scheduleDraft(input: {
  sessionOn: string;
  starts: string;
  ends: string;
  timeZone: string;
}): { ok: true; fields: ScheduleFields } | { ok: false; reason: string } {
  const sessionOn = input.sessionOn.trim();
  const starts = input.starts.trim();
  const ends = input.ends.trim();
  const timeZone = input.timeZone.trim() || "America/Mexico_City";
  if (!realDate(sessionOn)) return { ok: false, reason: "Falta la fecha." };
  if (!/^\d{2}:\d{2}/.test(starts) || !/^\d{2}:\d{2}/.test(ends)) {
    return { ok: false, reason: "Falta el horario." };
  }
  if (!isSessionZone(timeZone)) return { ok: false, reason: "Zona horaria inválida." };
  return {
    ok: true,
    fields: { session_on: sessionOn, starts_local: starts, ends_local: ends, time_zone: timeZone },
  };
}

type FormReader = { get(name: string): FormDataEntryValue | null };

type ScheduleFallback = {
  session_on?: string;
  starts_local?: string;
  ends_local?: string;
  time_zone?: string;
};

export function scheduleFromForm(form: FormReader, fallback?: ScheduleFallback) {
  return scheduleDraft({
    sessionOn: String(form.get("session_on") ?? fallback?.session_on ?? ""),
    starts: String(form.get("starts_local") ?? fallback?.starts_local ?? ""),
    ends: String(form.get("ends_local") ?? fallback?.ends_local ?? ""),
    timeZone: String(form.get("time_zone") ?? fallback?.time_zone ?? ""),
  });
}
