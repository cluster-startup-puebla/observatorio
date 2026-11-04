import Link from "next/link";

export function TermsAccept({
  checked,
  onChange,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const controlled = checked !== undefined;
  return (
    <label className="flex items-start gap-3 text-small text-ink">
      <input
        type="checkbox"
        name="terminos"
        value="si"
        checked={controlled ? checked : undefined}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
        className="mt-1"
      />
      <span>
        Acepto los{" "}
        <Link href="/aviso-de-privacidad" className="text-link" target="_blank" rel="noreferrer">
          términos y condiciones
        </Link>{" "}
        y el{" "}
        <Link href="/uso-de-datos" className="text-link" target="_blank" rel="noreferrer">
          uso de datos
        </Link>
        .
      </span>
    </label>
  );
}
