export function CupoSinCuentaHint({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <p className="text-small text-ink-muted" data-testid="tablero-sin-cuenta">
      {count.toLocaleString("es-MX")} confirmado{count === 1 ? "" : "s"} sin cuenta
    </p>
  );
}