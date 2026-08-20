import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "~/app/_components/eyebrow";
import { HomeMotionBackground } from "~/app/_components/motion-system";
import { PageShell } from "~/app/_components/site";
import { ENLACE_NO_VALIDO } from "~/lib/espacio";

/**
 * `GET /espacio/acceso/{token}` — la pantalla que **no canjea nada**.
 *
 * Es el destino del enlace de los correos, y su contrato con el monorepo está
 * escrito allí: `SPACE_ACCESS_PATH = "/espacio/acceso"` en
 * `packages/convex/convex/marketplace/email.ts`, con el token en el path y no en
 * la query.
 *
 * ## Por qué hay un botón en medio
 *
 * Porque el enlace es de un solo uso y hay software que abre enlaces sin que nadie
 * los pulse: los antivirus de correo corporativos, los previsualizadores de
 * enlaces de las apps de mensajería y el prefetch del navegador hacen `GET` a lo
 * que encuentran. Si este `GET` canjeara, el escáner del propio hospital quemaría
 * el enlace **antes** de que la dirección de compras llegara a verlo, y el primer
 * contacto del cliente con nosotros sería «este enlace ya no vale».
 *
 * Así que aquí no hay efectos: ni lectura de base, ni cookie, ni llamada a Convex.
 * Solo un formulario que hace `POST` a `/api/espacio/canje`, que es donde vive lo
 * irreversible. Cuesta un clic, y ese clic es además la confirmación que hace que
 * la pantalla siguiente no sea una sorpresa.
 *
 * Un clic de más también es la razón por la que **no** se hace lo contrario que
 * sería más cómodo: canjear en el `GET` y aceptar el riesgo. El coste de
 * equivocarse no es simétrico — un clic extra lo paga todo el mundo una vez; un
 * enlace quemado por un escáner deja al cliente sin entrar y con un correo que
 * escribir.
 *
 * ## El token se pinta en un campo oculto, y no pasa nada
 *
 * Ya venía en la URL de un correo que solo tiene el destinatario, así que el campo
 * no lo expone a nadie nuevo. Lo que sí evita el `POST` es que el token acabe en
 * el `Referer` de una navegación posterior, que es la otra fuga clásica de un
 * secreto que viaja en un path.
 *
 * `robots: noindex` y `force-dynamic`: es una URL de un solo uso, no una página.
 */

export const metadata: Metadata = {
  title: "Entrar en el espacio de cliente",
  description: "Confirma el acceso a tu espacio de cliente de AWS Marketplace.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Forma del token: 32 bytes en base64url son 43 caracteres, que es lo que emite
 * `newSpaceToken` en Convex. Se comprueba **antes** de pintar el botón para que un
 * enlace troceado por un cliente de correo —que parte las URLs largas— no acabe
 * en un `POST` que va a fallar: es más honesto decirlo aquí.
 */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,512}$/;

export default async function AccesoTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // **Sin `decodeURIComponent`.** Next ya decodifica el segmento dinámico, así que
  // decodificar otra vez es un doble decode: una URL con un `%` literal —un enlace
  // que un cliente de correo ha troceado y pegado mal— llega como `100%`, y
  // `decodeURIComponent("100%")` LANZA. El resultado sería la página de error
  // genérica justo en el sitio que existe para dar una pantalla amable.
  const bienFormado = TOKEN_PATTERN.test(token);

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />
        <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-32 pb-24 sm:px-8">
          <div className="shadow-big-blocks rounded-3xl border border-cyan-800/20 bg-white/80 p-7 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30">
            <Eyebrow>Espacio de cliente</Eyebrow>

            {bienFormado ? (
              <>
                <h1 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-50">
                  Ya casi estás dentro
                </h1>
                <p className="font-body mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                  Pulsa el botón para abrir tu espacio de cliente. El enlace
                  sirve una sola vez, así que no lo gastamos hasta que lo
                  confirmes tú.
                </p>

                {/* Sin `useState`, sin `fetch` y sin JavaScript: un formulario que
                    hace POST. Funciona con el bundle bloqueado, que en una red
                    hospitalaria no es un caso hipotético. */}
                <form
                  method="post"
                  action="/api/espacio/canje"
                  className="mt-7"
                >
                  <input type="hidden" name="token" value={token} />
                  <button
                    type="submit"
                    className="font-body bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-lighter flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 dark:text-[#04111e]"
                  >
                    <MailCheck
                      aria-hidden="true"
                      strokeWidth={1.8}
                      className="size-4"
                    />
                    Entrar en mi espacio de cliente
                  </button>
                </form>

                <p className="font-body mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Si no has pedido este enlace, cierra esta página: sin
                  confirmar no se abre ninguna sesión, y el enlace caduca solo a
                  los 30 minutos.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-50">
                  {ENLACE_NO_VALIDO.titulo}
                </h1>
                <p className="font-body mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                  {ENLACE_NO_VALIDO.cuerpo} Puede que el enlace se haya partido
                  al copiarlo del correo: los clientes de correo cortan las URLs
                  largas.
                </p>
                <Link
                  href="/espacio"
                  className="border-primary-light/25 font-body hover:border-primary-light/45 mt-7 inline-flex min-h-10 items-center rounded-full border bg-white/65 px-5 text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/3 dark:text-cyan-50 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10"
                >
                  Pedir un enlace nuevo
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </PageShell>
  );
}
