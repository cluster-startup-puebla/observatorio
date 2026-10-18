import type { Metadata } from "next";
import { LegalArticle, LegalHeading } from "@/components/legal/legal-article";
import { clusterEmail } from "@/content/landing";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Uso de datos",
  description:
    "Qué datos pide el registro del Observatorio, para qué se usa cada uno y qué nunca se publica.",
  path: "/uso-de-datos",
});

export default function DataUsePage() {
  return (
    <LegalArticle title="Uso de datos" updated="15 de octubre de 2026">
      <p>
        Esta página explica, en concreto, qué se hace con lo que dejas en el registro y en la
        sesión. El marco legal está en el{" "}
        <a href="/aviso-de-privacidad" className="text-link">
          aviso de privacidad
        </a>
        .
      </p>

      <LegalHeading>Qué pide el registro</LegalHeading>
      <ul className="list-disc space-y-2 pl-5">
        <li>Nombre y cargo: para saber quién asiste y a quién confirmarle el lugar.</li>
        <li>Empresa: para el cupo y para no publicar nada a tu nombre. No entra a un padrón.</li>
        <li>Sector y rango de empleados: para sentarte en la sesión correcta y agrupar el diagnóstico.</li>
        <li>Correo y WhatsApp: para confirmar el lugar y enviarte el diagnóstico de tu sector.</li>
        <li>Cómo te enteraste: para saber qué organismo te convocó. No se usa para publicidad.</li>
      </ul>
      <p>
        En la descarga del diagnóstico Puebla ante el T-MEC, el nombre, la empresa, la industria y
        el correo se usan para entregarte el PDF. No se publican y no arman un padrón.
      </p>

      <LegalHeading>Qué se publica</LegalHeading>
      <p>
        El Observatorio publica hallazgos agregados y anónimos por sector: tipos de necesidad, no
        empresas ni personas. Un dato solo se atribuye a tu empresa si tú lo autorizas por escrito,
        para ese caso.
      </p>

      <LegalHeading>Qué no se hace</LegalHeading>
      <ul className="list-disc space-y-2 pl-5">
        <li>No se venden los datos ni se rentan listas de contactos.</li>
        <li>No se arma un censo de empresas.</li>
        <li>No se piden datos sensibles ni datos de tarjetas.</li>
        <li>No se usa la sesión para cotizarte ni para venderte un producto.</li>
        <li>Aceptar un prototipo después es opcional y se decide aparte.</li>
      </ul>

      <LegalHeading>Quién los ve</LegalHeading>
      <p>
        El equipo del Clúster de Startups e Innovación que opera la sesión. La cámara u organismo
        que te convocó puede saber que confirmaste, para organizar a su sector. No recibe el
        detalle de lo que contaste en el diagnóstico.
      </p>

      <LegalHeading>Cuánto tiempo</LegalHeading>
      <p>
        El contacto vive mientras se confirma la sesión y se entrega el diagnóstico de ese
        levantamiento. Luego se borra o se bloquea. Puedes pedir la cancelación antes, en{" "}
        <a href={`mailto:${clusterEmail}`} className="text-link">
          {clusterEmail}
        </a>
        .
      </p>
    </LegalArticle>
  );
}
