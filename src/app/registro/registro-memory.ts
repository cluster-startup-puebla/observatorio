const key = "observatorio-registro";

export function readRegistroDone() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(key) === "1";
}

export function rememberRegistro() {
  window.localStorage.setItem(key, "1");
}
