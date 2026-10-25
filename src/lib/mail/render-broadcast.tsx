import { Body, Head, Html, Text } from "@react-email/components";
import { render } from "@react-email/render";
import type { BroadcastKind } from "./broadcast-audience";

const copy: Record<BroadcastKind, string> = {
  open_innovation:
    "¿Quieres ser una empresa de innovación abierta? Responde a este correo y te contamos cómo sumarte.",
  reminder: "Mañana es la sesión del Observatorio. Lleva tu pase.",
  thanks: "Gracias por venir. En unos días te escribimos con el seguimiento.",
};

export function renderBroadcast(kind: BroadcastKind) {
  return render(
    <Html>
      <Head />
      <Body>
        <Text>{copy[kind]}</Text>
      </Body>
    </Html>,
    { pretty: false },
  );
}
