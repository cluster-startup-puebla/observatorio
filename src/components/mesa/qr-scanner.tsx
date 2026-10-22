"use client";

import { useEffect, useRef, useState } from "react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

export function MesaQrScanner({ hold }: { hold: string }) {
  const last = useRef(hold);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => setReady(true), []);

  function onScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue?.trim() ?? "";
    if (!value || value === last.current) return;
    const input = document.getElementById("codigo");
    if (!(input instanceof HTMLInputElement) || !input.form) return;
    last.current = value;
    input.value = value;
    input.form.requestSubmit();
  }

  return (
    <div className="grid gap-2">
      <div className="h-[280px] overflow-hidden rounded-sm border border-line bg-black">
        {ready ? (
          <Scanner
            onScan={onScan}
            onError={() => setCameraError("No se pudo abrir la cámara. Escribe el código.")}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code"]}
            scanDelay={800}
            sound={false}
            styles={{
              container: { width: "100%", height: 280 },
              video: { width: "100%", height: 280, objectFit: "cover" },
            }}
          />
        ) : null}
      </div>
      <p className={cameraError ? "text-small text-mark" : "text-small text-ink-secondary"}>
        {cameraError || "Apunta la cámara al pase para registrar la llegada."}
      </p>
    </div>
  );
}
