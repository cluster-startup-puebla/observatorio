import { Button } from "@/components/ui/button";

export function AcceptForm({ token }: { token: string }) {
  return (
    <form action="/api/innovacion-abierta/aceptar" method="post">
      <input type="hidden" name="token" value={token} />
      <Button type="submit">Sí, pueden contactarme</Button>
    </form>
  );
}
