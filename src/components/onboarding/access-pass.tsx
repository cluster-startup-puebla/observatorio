import { accessQrDataUrl } from "@/lib/onboarding/access-qr";

export async function AccessPass({ code }: { code: string }) {
  const src = await accessQrDataUrl(code);

  return (
    <div className="grid w-fit gap-3">
      <p data-testid="qr-listo" className="text-h3 text-ink">
        Tu pase quedó listo.
      </p>
      {/* Data URL from our own generator. next/image does not accept it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="qr-acceso"
        src={src}
        alt="QR de acceso"
        width={220}
        height={220}
        className="rounded-sm border border-line bg-white p-3"
      />
    </div>
  );
}
