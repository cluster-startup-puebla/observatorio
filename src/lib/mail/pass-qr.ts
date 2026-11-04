import QRCode from "qrcode";

export type PassAttachment = {
  filename: "pase.png";
  content: string;
  contentType: "image/png";
  contentId: "pase";
};

export async function passQrAttachment(profileId: string): Promise<PassAttachment> {
  const code = profileId.trim();
  if (!code) throw new Error("sin pase");
  const png = await QRCode.toBuffer(code, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: { dark: "#16284f", light: "#ffffff" },
  });
  return {
    filename: "pase.png",
    content: png.toString("base64"),
    contentType: "image/png",
    contentId: "pase",
  };
}
