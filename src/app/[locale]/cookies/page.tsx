import type { Metadata } from "next";

import {
  LEGAL_OWNER,
  LegalLink,
  LegalPage,
  LegalSection,
} from "~/app/_components/legal-page";
import { REGISTRATION_COOKIE_NAME } from "~/server/marketplace/registration";
import { SESSION_COOKIE_NAME } from "~/server/marketplace/session";
import { SPACE_COOKIE_NAME } from "~/server/marketplace/space-session";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies y almacenamiento local usa el sitio web de BinPar y para qué.",
};

/*
  La lista sale del código, no de una plantilla: si se añade una cookie o un
  servicio de terceros (analítica, vídeo, etc.), esta página y, si deja de ser
  técnica, un aviso de consentimiento tienen que cambiar con ella.
*/
const storageItems = [
  {
    name: SESSION_COOKIE_NAME,
    kind: "Cookie técnica propia",
    purpose:
      "Mantiene la sesión del evaluador de idoneidad mientras haces la entrevista.",
    duration: "Hasta 7 días",
  },
  {
    name: SPACE_COOKIE_NAME,
    kind: "Cookie técnica propia",
    purpose:
      "Mantiene la sesión del espacio de cliente tras entrar con el enlace de acceso.",
    duration: "Hasta 7 días",
  },
  {
    name: REGISTRATION_COOKIE_NAME,
    kind: "Cookie técnica propia",
    purpose:
      "Recuerda el alta que llega desde AWS Marketplace para completar el registro.",
    duration: "Hasta 7 días",
  },
  {
    name: "consensus-theme",
    kind: "Almacenamiento local propio",
    purpose: "Recuerda si prefieres ver el sitio en modo claro u oscuro.",
    duration: "Hasta que lo borres desde el navegador",
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <LegalSection title="Qué usamos">
        <p>
          Este sitio solo usa cookies técnicas y almacenamiento local propios,
          necesarios para que funcionen las partes que lo requieren o para
          recordar una preferencia que eliges tú. No usamos cookies de
          analítica, publicidad ni seguimiento, y por eso no te pedimos
          consentimiento al entrar.
        </p>
        <p>
          Las cookies de sesión solo se crean si usas el evaluador de idoneidad,
          el espacio de cliente o llegas desde AWS Marketplace. Navegar por el
          resto del sitio no crea ninguna.
        </p>
      </LegalSection>
      <LegalSection title="Detalle">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm leading-6">
            <thead className="font-display text-navy dark:text-slate-100">
              <tr className="dark:border-primary-dark/15 border-b border-cyan-800/15">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Nombre
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Tipo
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Finalidad
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody>
              {storageItems.map((item) => (
                <tr
                  key={item.name}
                  className="dark:border-primary-dark/10 border-b border-cyan-800/10 align-top"
                >
                  <td className="py-3 pr-4 font-mono text-xs leading-6">
                    {item.name}
                  </td>
                  <td className="py-3 pr-4">{item.kind}</td>
                  <td className="py-3 pr-4">{item.purpose}</td>
                  <td className="py-3">{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
      <LegalSection title="Servicios de terceros">
        <p>
          El mapa de la página de{" "}
          <LegalLink href="/contacto">contacto</LegalLink> se carga desde
          OpenFreeMap. Para mostrarlo, tu navegador pide las imágenes del mapa a
          sus servidores, que reciben tu dirección IP como en cualquier petición
          web.
        </p>
      </LegalSection>
      <LegalSection title="Cómo gestionarlas">
        <p>
          Puedes consultar y borrar las cookies y el almacenamiento local desde
          la configuración de tu navegador. Si los bloqueas, el sitio se puede
          seguir visitando, pero el evaluador y el espacio de cliente no
          funcionarán y no se recordará el modo claro u oscuro.
        </p>
        <p>
          Para cualquier duda, escríbenos a {LEGAL_OWNER.email}. Más información
          sobre tus datos en la{" "}
          <LegalLink href="/privacidad">política de privacidad</LegalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
