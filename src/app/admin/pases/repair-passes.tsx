export function RepairPasses() {
  return (
    <form action="/api/admin/pases/faltantes" method="post">
      <button className="btn btn-primary" type="submit">Generar los que faltan</button>
    </form>
  );
}
