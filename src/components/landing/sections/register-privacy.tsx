import Link from "next/link";

export function RegisterPrivacy({
  checked,
  error,
  onChange,
}: {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="flex items-start gap-3 text-small text-ink-secondary">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1" />
        <span>
          Acepto el{" "}
          <Link href="/aviso-de-privacidad" className="text-link">
            aviso de privacidad
          </Link>{" "}
          y el{" "}
          <Link href="/uso-de-datos" className="text-link">
            uso de datos
          </Link>
          .
        </span>
      </label>
      {error ? <p className="text-small text-mark">{error}</p> : null}
    </div>
  );
}
