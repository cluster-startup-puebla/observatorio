"use client";

import { useEffect, useRef, useState } from "react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

export function MesaQrScanner({ hold, paused = false }: { hold: string; paused?: boolean }) {
  const last = useRef(hold);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => setReady(true), []);

  function onScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue?.trim() ?? "";
    if (!value || value === last.current || paused) return;
    const input = document.getElementById("codigo");
    if (!(input instanceof HTMLInputElement) || !input.form) return;
    last.current = value;
    input.value = value;
    input.form.requestSubmit();
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="grid w-full max-w-[min(100%,calc(100dvh-18rem))] gap-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-black">
          {ready ? (
            <Scanner
              onScan={onScan}
              onError={() => setCameraError("No se pudo abrir la cámara.")}
              paused={paused}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              components={{ finder: false, torch: false, onOff: false, zoom: false }}
              scanDelay={800}
              sound={false}
              styles={{
                container: { width: "100%", height: "100%", aspectRatio: "1 / 1" },
                video: { width: "100%", height: "100%", objectFit: "contain" },
              }}
            />
          ) : null}
        </div>
        <p className={cameraError ? "text-center text-small text-mark" : "text-center text-small text-ink-secondary"}>
          {cameraError || "Apunta la cámara al pase."}
        </p>
      </div>
    </div>
  );
}
