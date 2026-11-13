export function AcceptRegistro({ id, completed, poured }: { id: string; completed: string; poured: string }) {
  if (!completed) return null;
  return (
    <form action={`/api/admin/registros/${id}/aceptar`} method="post">
      <button className="btn btn-primary" type="submit">{poured ? "Enviar pase" : "Aceptar"}</button>
    </form>
  );
}
