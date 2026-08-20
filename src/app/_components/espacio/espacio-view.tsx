import {
  ArrowUpRight,
  FileText,
  LifeBuoy,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Eyebrow } from "~/app/_components/eyebrow";
import {
  cuerpoConFecha,
  ESTADO_COPY,
  muestraAccesoPlataforma,
  PT_BAJO_CABECERA,
  PT_SEGUIDO,
  type EstadoCopy,
  type EstadoSuscripcion,
} from "~/lib/espacio";

/**
 * Los cuatro bloques del espacio de cliente (issue #7 §4): estado, informe,
 * soporte y badge, más el acceso a la plataforma cuando toca.
 *
 * ## Esto NO es la plataforma
 *
 * No hay corpus, ni chat, ni expertos, ni gestión de usuarios, ni un solo dato de
 * paciente: es un alta comercial. Y con el modelo SaaS free tampoco hay
 * facturación, así que no hay historial de pagos, ni consumo, ni dimensiones —el
 * estado son tres valores y una fecha. Si esta vista crece más allá de estos
 * cuatro bloques, la decisión de no usar Clerk hay que reabrirla.
 *
 * ## Componente de servidor, sin islas
 *
 * Todo llega por props y nada se pinta en el navegador. No es una preferencia de
 * estilo: los cuatro dígitos de la cuenta de AWS y el estado comercial de una
 * institución no tienen por qué pasar por un bundle de JavaScript ni por el estado
 * de un componente cliente.
 */

/** El recipiente del sistema. Mismo que la página del informe. */
const CARD =
  "shadow-big-blocks rounded-2xl border border-cyan-800/15 bg-white/80 backdrop-blur-xs dark:border-cyan-300/15 dark:bg-[#152230e6]/90";

const H2 =
  "font-display text-xl font-bold tracking-tight text-[#05215e] dark:text-slate-50";
const LEDE =
  "font-body mt-2.5 text-[15px] leading-7 text-slate-600 dark:text-slate-400";
const ROTULO = "font-display text-[11px] font-bold tracking-[0.14em] uppercase";

/**
 * Los cuatro tokens del semáforo, escritos como cadenas COMPLETAS.
 *
 * Nunca interpoladas (`bg-(--semaforo-${color})` no existe para Tailwind, que lee
 * el código fuente y no lo ejecuta). Misma disciplina que `informe-view.tsx`.
 */
const SEMAFORO: Record<
  EstadoCopy["color"],
  { filete: string; texto: string; punto: string }
> = {
  ok: {
    filete: "bg-(--semaforo-ok)",
    texto: "text-(--semaforo-ok)",
    punto: "bg-(--semaforo-ok)",
  },
  mid: {
    filete: "bg-(--semaforo-mid)",
    texto: "text-(--semaforo-mid)",
    punto: "bg-(--semaforo-mid)",
  },
  neutro: {
    filete: "bg-(--semaforo-neutro)",
    texto: "text-(--semaforo-neutro)",
    punto: "bg-(--semaforo-neutro)",
  },
};

export type EspacioViewProps = {
  estado: EstadoSuscripcion;
  /** Fecha de la última transición, ya formateada. */
  fechaEstado: string;
  /** Fecha comprometida de contacto, ya formateada. Solo se usa en `resolved`. */
  fechaPlazo: string | null;
  /** Cuatro dígitos de la cuenta de AWS. Nunca la cuenta. */
  awsLast4: string;
  informe: { url: string; titular: string; nivelNombre: string } | null;
  soporte: { email: string; contacto?: string };
  /** `/sign-in` de la plataforma. Solo se pinta en `provisioned`. */
  plataformaUrl: string;
  /**
   * Hay un aviso encima, que ya ha puesto la separación con la cabecera fija. Sin
   * esto, el aviso y el título sumarían dos veces el mismo `pt` y quedaría un
   * hueco de 80 px en medio.
   */
  pegadoAlAviso?: boolean;
};

export function EspacioView({
  estado,
  fechaEstado,
  fechaPlazo,
  awsLast4,
  informe,
  soporte,
  plataformaUrl,
  pegadoAlAviso = false,
}: EspacioViewProps) {
  const copy = ESTADO_COPY[estado];
  const semaforo = SEMAFORO[copy.color];
  const asunto = encodeURIComponent(
    `Espacio de cliente · cuenta ····${awsLast4}`,
  );

  return (
    <div
      className={`relative z-10 mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8 ${
        pegadoAlAviso ? PT_SEGUIDO : PT_BAJO_CABECERA
      }`}
    >
      <Eyebrow>Espacio de cliente</Eyebrow>
      <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
        Tu suscripción de AWS Marketplace
      </h1>

      {/* Badge · la cuenta verificada. Texto con icono, no una pastilla: es como
          se dice «verificado» en este sistema (misma forma que en el informe). */}
      <p className="text-primary-light dark:text-primary-dark mt-5 inline-flex items-center gap-2 text-[13px] font-semibold">
        <ShieldCheck aria-hidden="true" strokeWidth={1.8} className="size-4" />
        Cuenta de AWS Marketplace verificada · ····{awsLast4}
      </p>

      {/* Bloque 1 · el estado. El filete de color tipa la tarjeta sin teñirla. */}
      <section
        className={`mt-8 overflow-hidden ${CARD}`}
        aria-labelledby="estado-suscripcion"
      >
        <div aria-hidden="true" className={`h-1 ${semaforo.filete}`} />
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${semaforo.punto}`}
            />
            {/* El color nunca viaja solo: su palabra va escrita al lado. */}
            <span className={`${ROTULO} ${semaforo.texto}`}>{copy.rotulo}</span>
          </div>
          <h2 id="estado-suscripcion" className={`${H2} mt-3`}>
            {copy.titular}
          </h2>
          <p className={LEDE}>{cuerpoConFecha(copy.cuerpo, fechaPlazo)}</p>
          <p className="font-body mt-4 text-xs text-slate-500 dark:text-slate-400">
            {copy.fechaRotulo} {fechaEstado}
          </p>

          {muestraAccesoPlataforma(estado) ? (
            <Link
              href={plataformaUrl}
              className="dark:bg-secondary-dark focus-visible:outline-secondary-dark shadow-big-blocks font-body bg-secondary-light mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-bold text-[#06111f] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none"
            >
              <LogIn aria-hidden="true" strokeWidth={1.8} className="size-4" />
              Entrar en la plataforma
            </Link>
          ) : null}
        </div>
      </section>

      {/* Bloque 2 · el informe. Enlazado, no embebido: es una página que ya
          existe, se puede reenviar dentro de la institución y duplicar aquí su
          contenido daría dos sitios donde leer lo mismo y uno donde corregirlo. */}
      <section
        className={`mt-6 p-6 sm:p-7 ${CARD}`}
        aria-labelledby="informe-idoneidad"
      >
        <p className={`${ROTULO} text-primary-light dark:text-primary-dark`}>
          Informe de idoneidad
        </p>
        {informe === null ? (
          <>
            <h2 id="informe-idoneidad" className={`${H2} mt-3`}>
              Todavía no hay informe publicado.
            </h2>
            <p className={LEDE}>
              El informe se publica al terminar la evaluación de idoneidad.
              Cuando esté, aparecerá aquí con su enlace permanente.
            </p>
          </>
        ) : (
          <>
            <h2 id="informe-idoneidad" className={`${H2} mt-3`}>
              {informe.titular}
            </h2>
            <p className={LEDE}>
              Nivel de encaje:{" "}
              <span className="font-semibold">{informe.nivelNombre}</span>. El
              informe completo es reenviable dentro de tu institución.
            </p>
            <Link
              href={informe.url}
              className="border-primary-light/25 font-body hover:border-primary-light/45 mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border bg-white/65 px-5 text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/3 dark:text-cyan-50 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10"
            >
              <FileText
                aria-hidden="true"
                strokeWidth={1.8}
                className="size-4"
              />
              Abrir el informe
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.8}
                className="size-4"
              />
            </Link>
          </>
        )}
      </section>

      {/* Bloque 3 · soporte, con persona de contacto. Requisito de AWS: el canal
          tiene que estar visible dentro de la aplicación, no en un pie de página. */}
      <section className={`mt-6 p-6 sm:p-7 ${CARD}`} aria-labelledby="soporte">
        <p className={`${ROTULO} text-primary-light dark:text-primary-dark`}>
          Soporte
        </p>
        <h2 id="soporte" className={`${H2} mt-3`}>
          Escríbenos y te responde una persona.
        </h2>
        <p className={LEDE}>
          {soporte.contacto !== undefined
            ? `Tu contacto es ${soporte.contacto}. Respondemos en horario laboral de España.`
            : "Respondemos en horario laboral de España."}
        </p>
        <a
          href={`mailto:${soporte.email}?subject=${asunto}`}
          className="text-primary-light dark:text-secondary-dark font-body mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
        >
          <LifeBuoy aria-hidden="true" strokeWidth={1.8} className="size-4" />
          {soporte.email}
        </a>
      </section>

      <p className="font-body mt-8 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Esta página es el espacio de cliente de tu suscripción de AWS
        Marketplace: el estado del acuerdo, el informe y el canal de soporte. No
        contiene datos de pacientes.
      </p>
    </div>
  );
}
