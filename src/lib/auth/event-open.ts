const FALLBACK_ZONE = "America/Mexico_City";

function zonedStamp(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  return `${date}T${get("hour")}:${get("minute")}:${get("second")}`;
}

function startStamp(sessionOn: string, startsLocal: string) {
  const [hour = "00", minute = "00", second = "00"] = startsLocal.trim().split(":");
  const clock = [hour, minute, second].map((part) => part.padStart(2, "0")).join(":");
  return `${sessionOn.trim()}T${clock}`;
}

export function eventIsOpen(input: {
  now: Date;
  sessionOn: string;
  startsLocal: string;
  timeZone: string | null;
}) {
  const zone = input.timeZone?.trim() || FALLBACK_ZONE;
  return zonedStamp(input.now, zone) >= startStamp(input.sessionOn, input.startsLocal);
}
