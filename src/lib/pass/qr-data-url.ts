import "server-only";

import { passQrAttachment } from "@/lib/mail/pass-qr";

export async function passQrDataUrl(code: string) {
  const qr = await passQrAttachment(code);
  return `data:image/png;base64,${qr.content}`;
}
