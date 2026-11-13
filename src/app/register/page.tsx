import { redirect } from "next/navigation";

export const instant = false;

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const search = query.toString();
  redirect(search ? `/crear-cuenta?${search}` : "/crear-cuenta");
}
