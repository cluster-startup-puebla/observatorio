import Image from "next/image";
import { conveners } from "@/content/conveners";
import { allyHeight } from "@/components/program/pxp/ally-scale";

const top = [
  "cluster-agroalimentario-puebla",
  "cluster-plasticos-economia-circular",
  "clauz-cluster-automotriz-zona-centro",
  "cluster-educacion-desarrollo-talento",
  "vive-puebla-cluster-industria-reuniones",
  "puebla-care",
  "cluster-chignahuapan-zacatlan",
  "cluster-quimica-farmaceutica",
  "cce-puebla",
];

const frame: Record<string, [number, number]> = {
  "cluster-quimica-farmaceutica": [344, 343],
  canacine: [1332, 421],
};

const fileOf = (src: string) => src.split("/").pop()?.replace(".webp", "") ?? "";
const byFile = new Map(conveners.map((logo) => [fileOf(logo.src), logo]));
const first = top.map((file) => byFile.get(file)).filter((logo) => logo !== undefined);
const rest = conveners
  .filter((logo) => !top.includes(fileOf(logo.src)))
  .sort((a, b) => a.alt.localeCompare(b.alt, "es"));
const logos = [...first, ...rest];

export function AllyReel() {
  return (
    <ul className="mx-auto grid max-w-[1100px] grid-cols-3 gap-x-4 gap-y-4 px-4 py-5 sm:grid-cols-6 lg:grid-cols-9">
      {logos.map((logo) => (
        <li key={logo.src} className="grid h-16 place-items-center">
          <Image
            src={logo.src.replace("/convocantes/", "/convocantes/negativo/")}
            alt={logo.alt}
            width={frame[fileOf(logo.src)]?.[0] ?? logo.width}
            height={frame[fileOf(logo.src)]?.[1] ?? logo.height}
            unoptimized
            style={{ height: allyHeight[fileOf(logo.src)] ?? 36, width: "auto" }}
            className="max-w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
}
