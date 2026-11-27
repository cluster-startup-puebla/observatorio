const prefix = "observatorio-registro:";

export function registroStorageKey(sessionId: string) {
  const clean = sessionId.trim();
  return clean ? `${prefix}${clean}` : "";
}

export function readRegistroDone(sessionId: string) {
  if (typeof window === "undefined") return false;
  const key = registroStorageKey(sessionId);
  if (!key) return false;
  return window.localStorage.getItem(key) === "1";
}

export function rememberRegistro(sessionId: string) {
  if (typeof window === "undefined") return;
  const key = registroStorageKey(sessionId);
  if (!key) return;
  window.localStorage.setItem(key, "1");
}
