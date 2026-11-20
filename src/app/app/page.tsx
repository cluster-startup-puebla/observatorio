import { redirect } from "next/navigation";

export const instant = false;

export default function AppIndexPage() {
  redirect("/app/home");
}
