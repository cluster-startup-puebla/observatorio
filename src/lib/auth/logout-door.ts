export type LogoutDoor = "home" | "admin";

export function logoutDestination(door: LogoutDoor) {
  return door === "home" ? "/" : "/admin/login";
}
