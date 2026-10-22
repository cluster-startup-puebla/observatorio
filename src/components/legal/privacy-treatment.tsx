import { LegalHeading } from "@/components/legal/legal-article";
import { clusterEmail, clusterUrl } from "@/content/landing";

export function PrivacyTreatment() {
  return (
    <>
      <p>
        Este aviso integral se emite conforme a la Ley Federal de Protección de Datos Personales en
        Posesión de los Particulares, publicada en el Diario Oficial de la Federación el 20 de
        marzo de 2025. Describe el tratamiento de los datos que pides dejar en el registro y en la
        sesión sectorial.
      </p>

      <LegalHeading>Responsable</LegalHeading>
      <p>
        El responsable es el Clúster de Startups e Innovación, que opera el Observatorio
        Tecnológico de Puebla. Domicilio: Puebla, Puebla, México. El domicilio para oír y recibir
        notificaciones es el que el Clúster publica en{" "}
        <a href={clusterUrl} className="text-link" target="_blank" rel="noopener noreferrer">
          clusterdestartups.org
        </a>
        . Correo:{" "}
        <a href={`mailto:${clusterEmail}`} className="text-link">
          {clusterEmail}
        </a>
        .
      </p>

      <LegalHeading>Datos que se tratan</LegalHeading>
      <p>En el registro se piden estos datos personales:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Nombre.</li>
        <li>Cargo.</li>
        <li>Empresa.</li>
        <li>Sector o actividad principal.</li>
        <li>Número de empleados, en rango.</li>
        <li>Correo.</li>
        <li>WhatsApp.</li>
        <li>Organismo por el que te enteraste.</li>
      </ul>
      <p>
        Para descargar el diagnóstico Puebla ante el T-MEC se piden nombre, empresa, industria y
        correo. Sirven para entregarte el documento y saber de qué industria llega cada solicitud.
      </p>
      <p>
        En la sesión puedes contar problemas de operación de tu empresa. Eso se trata como
        información confidencial de la empresa y, si te identifica, como dato personal.
      </p>
      <p>
        No se piden datos sensibles: salud, origen étnico, creencias, opiniones políticas,
        preferencia sexual ni datos genéticos o biométricos. Si alguien los menciona, no se
        registran.
      </p>

      <LegalHeading>Para qué se usan</LegalHeading>
      <p>Finalidades necesarias para darte el lugar y la sesión:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Confirmar tu lugar y avisarte por correo o WhatsApp.</li>
        <li>Ubicar la sesión de tu sector y el cupo.</li>
        <li>Identificarte el día de la sesión.</li>
      </ul>
      <p>Finalidades que requieren tu consentimiento, el que das al aceptar este aviso:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Usar lo que cuentes en la sesión para el Observatorio, solo en forma agregada y anónima
          por sector.
        </li>
        <li>Enviarte el diagnóstico de tu sector cuando se publique.</li>
        <li>
          Contactarte si más adelante hay un prototipo relacionado con una necesidad que hayas
          expresado. Puedes negarte y no cambia tu lugar en la sesión.
        </li>
      </ul>
      <p>
        No se usan para venderte un producto, armar un padrón o censo, ni para una finalidad
        distinta. Si eso cambiara, se te pediría consentimiento de nuevo.
      </p>
    </>
  );
}
