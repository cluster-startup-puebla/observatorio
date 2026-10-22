import QRCode from "qrcode";

export function accessQrDataUrl(code: string) {
  return QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: { dark: "#111111", light: "#ffffff" },
  });
}
