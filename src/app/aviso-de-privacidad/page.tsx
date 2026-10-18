import type { Metadata } from "next";
import { LegalArticle, LegalHeading } from "@/components/legal/legal-article";
import { clusterEmail, clusterUrl } from "@/content/landing";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad integral del Observatorio Tecnológico de Puebla, conforme a la ley federal de datos personales.",
  path: "/aviso-de-privacidad",
});

export default function PrivacyPage() {
  return (
    <LegalArticle title="Aviso de privacidad" updated="15 de octubre de 2026">
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

      <LegalHeading>Cómo limitar el uso</LegalHeading>
      <p>
        Puedes pedir que no te escribamos por WhatsApp, que no te contactemos para prototipos o que
        tu participación no entre al Observatorio. Escríbelo a{" "}
        <a href={`mailto:${clusterEmail}`} className="text-link">
          {clusterEmail}
        </a>{" "}
        con el asunto «Limitar uso de datos». Tu lugar en la sesión se conserva si la limitación no
        impide confirmarte.
      </p>

      <LegalHeading>Derechos ARCO</LegalHeading>
      <p>
        Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos. La solicitud
        es gratuita y se envía al mismo correo, con:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Tu nombre y un medio para responderte.</li>
        <li>Una copia de identificación o el correo con el que te registraste.</li>
        <li>Qué derecho quieres ejercer y sobre qué datos.</li>
        <li>Si pides rectificación, el dato correcto y el soporte, si lo tienes.</li>
      </ul>
      <p>
        El Clúster responde en un máximo de 20 días hábiles. Si procede, lo hace efectivo en los 15
        días hábiles siguientes. Esos plazos pueden ampliarse una sola vez por el mismo periodo,
        con aviso. El acceso se entrega cuando acreditas tu identidad.
      </p>
      <p>
        Si no hay respuesta, o no estás de acuerdo con ella, puedes acudir a la Secretaría
        Anticorrupción y Buen Gobierno, autoridad competente en la ley, dentro de los 15 días
        hábiles siguientes.
      </p>

      <LegalHeading>Transferencias</LegalHeading>
      <p>
        No se venden ni se ceden para publicidad. Tu nombre, empresa y sector pueden compartirse
        con la cámara u organismo que te convocó, solo para confirmar que asistirás a la sesión de
        ese sector. Quien reciba esos datos queda obligado a usarlos con la misma finalidad.
      </p>
      <p>
        El correo o WhatsApp de confirmación puede enviarse con un proveedor que trata los datos
        por cuenta del Clúster. Eso no es una cesión para uso propio del proveedor.
      </p>

      <LegalHeading>Conservación</LegalHeading>
      <p>
        Los datos de contacto se conservan mientras dura el levantamiento de tu sector y el envío
        del diagnóstico. Después se bloquean y se suprimen cuando ya no hagan falta para esa
        finalidad ni para una responsabilidad legal. Lo que se publica en el Observatorio no lleva
        tu nombre ni el de tu empresa.
      </p>

      <LegalHeading>Cambios a este aviso</LegalHeading>
      <p>
        Cualquier cambio se publica en esta página, con la fecha de actualización. Si el cambio
        afecta una finalidad que ya consentiste, se te avisa al correo del registro antes de
        aplicarlo.
      </p>

      <p>
        El detalle de qué pasa con cada dato está en{" "}
        <a href="/uso-de-datos" className="text-link">
          Uso de datos
        </a>
        .
      </p>
    </LegalArticle>
  );
}
