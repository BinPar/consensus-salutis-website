import type { Metadata } from "next";

import {
  LEGAL_OWNER,
  LegalLink,
  LegalPage,
  LegalSection,
} from "~/app/_components/legal-page";

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Datos del titular y condiciones de uso del sitio web de BinPar.",
};

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal">
      <LegalSection title="Titular del sitio web">
        <p>
          En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la
          información y de comercio electrónico (LSSI-CE), te informamos de que
          este sitio web es titularidad de {LEGAL_OWNER.name}, con NIF{" "}
          {LEGAL_OWNER.nif} y domicilio en {LEGAL_OWNER.address}. Puedes
          contactar con nosotros escribiendo a {LEGAL_OWNER.email}.
        </p>
      </LegalSection>
      <LegalSection title="Objeto y condiciones de uso">
        <p>
          Este sitio web presenta BinPar, sus servicios y su equipo, y ofrece
          canales para contactar con nosotros. El acceso es gratuito e implica
          aceptar este aviso legal. Te comprometes a hacer un uso adecuado del
          sitio y de sus contenidos, conforme a la ley y a la buena fe, y a no
          emplearlos para actividades ilícitas o que puedan dañar el sitio o a
          terceros.
        </p>
        <p>
          Los contenidos del sitio son informativos. No constituyen consejo
          médico ni sustituyen el criterio de un profesional sanitario.
        </p>
      </LegalSection>
      <LegalSection title="Propiedad intelectual e industrial">
        <p>
          Los textos, imágenes, diseños, logotipos, marcas, código fuente y
          demás contenidos de este sitio pertenecen a {LEGAL_OWNER.name} o a
          terceros que han autorizado su uso. No está permitida su reproducción,
          distribución, comunicación pública o transformación sin autorización
          expresa, salvo en los casos que permita la ley.
        </p>
      </LegalSection>
      <LegalSection title="Responsabilidad y enlaces">
        <p>
          Trabajamos para que la información del sitio sea correcta y esté
          actualizada, pero no podemos garantizar que esté libre de errores ni
          que el acceso sea ininterrumpido. El sitio puede incluir enlaces a
          páginas de terceros, sobre cuyos contenidos y políticas no tenemos
          control ni responsabilidad.
        </p>
      </LegalSection>
      <LegalSection title="Datos personales y cookies">
        <p>
          El tratamiento de los datos personales se explica en la{" "}
          <LegalLink href="/privacidad">política de privacidad</LegalLink>, y el
          uso de cookies y almacenamiento local, en la{" "}
          <LegalLink href="/cookies">política de cookies</LegalLink>.
        </p>
      </LegalSection>
      <LegalSection title="Legislación aplicable">
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier
          controversia, las partes se someten a los juzgados y tribunales que
          correspondan conforme a la normativa aplicable.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
