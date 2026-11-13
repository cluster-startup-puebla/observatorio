import { Button } from "@/components/ui/button";

export function LlegadaTab({ id, arrived, scanner }: { id: string; arrived: string; scanner: string }) {
  if (arrived) {
    return <p className="text-body text-ink">{scanner ? `Llegó ${arrived} · ${scanner}` : `Llegó ${arrived}`}</p>;
  }
  return (
    <form action={`/api/admin/pases/${id}/llegada`} method="post">
      <Button type="submit">Marcar que llegó</Button>
    </form>
  );
}
