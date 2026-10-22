import Link from "next/link";
import { LegalHeading } from "@/components/legal/legal-article";
import { clusterEmail } from "@/content/landing";

export function PrivacyRights() {
  return (
    <>
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
        <Link href="/uso-de-datos" className="text-link">
          Uso de datos
        </Link>
        .
      </p>
    </>
  );
}
