/**
 * La página del informe de idoneidad, diseño «Oportunidad» (issue #6).
 *
 * ## La página vende el proyecto, no el examen
 *
 * Cuatro bandas y el cambio de fondo es lo único que separa una sección de la
 * siguiente: el suelo del hero del sitio (rejilla + degradado + campo de señal)
 * → panel → papel → panel → banda profunda como pie. El ORDEN es el argumento:
 *
 *   titular (la oportunidad) → qué podemos hacer → la primera fase, juntos →
 *   de dónde sale el nivel
 *
 * El semáforo va al FINAL, como evidencia de lo de arriba. Antes abría la
 * página, y una página que abre con las notas es un examen.
 *
 * Decisiones que vienen del diseño y no son negociables aquí:
 *
 * - **La palabra más grande de la página no es una nota.** El `h1` es la
 *   oportunidad —«Hay por dónde empezar, ya»—; el nivel no desaparece, baja a
 *   una línea rotulada con su color justo debajo.
 * - **El nivel es UNA línea sin segmentar.** Una cinta partida en cinco diría
 *   que el nivel es la suma de cinco notas, y no lo es: el nivel es una cosa y
 *   las cinco dimensiones son el porqué.
 * - **«A explorar» va en neutro**, ni rojo (suspendería a quien no está
 *   suspendido) ni acento (daría por bueno lo que aún no lo es). El neutro es el
 *   cuarto color y no es del semáforo.
 * - **El color nunca va solo**: cada estado lleva su palabra escrita al lado.
 * - **Los puntos del plan van RELLENOS**, cada uno del color de su estado. Los
 *   aros vacíos hacían que el plan pareciera una lista de casillas sin marcar.
 * - **Cada paso dice qué ponemos nosotros** (`apoyo`): el plan es la primera
 *   fase del proyecto, no deberes para antes de la llamada.
 * - **La CTA amarilla es «Empezar la conversación»** y va delante de copiar el
 *   enlace: el contraste de la marca puesto en no esperar los cinco días.
 *   Copiar el enlace sigue siendo la única compensación por no generar PDF, y
 *   por eso conserva el relleno de acento; no hay botón de imprimir.
 * - **Plazo y soporte en la primera pantalla**: los dos son requisito de AWS.
 * - **Lo fuera de alcance va en UNA LÍNEA**, no en una caja: en caja tenía un
 *   peso que no tiene.
 * - **La URL y la fecha van escritas en el pie** aunque en pantalla sean
 *   redundantes: quien necesite adjuntar algo al correo hará una captura, y una
 *   captura tiene que identificarse sola.
 *
 * ## El literal del nivel se queda en el servidor
 *
 * `report.nivel` decide el color de la línea AQUÍ, en un server component, y lo
 * que viaja al navegador es la clase ya resuelta. En el HTML solo existen
 * `nivelNombre` y las palabras de estado — mismo criterio que la entrevista,
 * aplicado a la superficie que sí enseña el semáforo.
 *
 * ## Degradación sin encaje estructurado
 *
 * Si la evaluación no trae el tablero (`encaje`) o las dimensiones —un informe
 * anterior al contrato #90, o un JSON que no validó ni al reintento—, las bandas
 * estructuradas se sustituyen por el markdown del informe entero, que dice lo
 * mismo en prosa. El hero y el pie no cambian. `titular` y `apoyo` degradan por
 * separado y sin ruido: el primero cae al titular por nivel, el segundo
 * simplemente no pinta su línea.
 */

import { ArrowRight, ShieldCheck } from "lucide-react";

import { CopyReportLink } from "~/app/_components/informe/copy-report-link";
import { Markdown } from "~/app/_components/interview/markdown";
import { Eyebrow } from "~/app/_components/eyebrow";
import { SignalField } from "~/app/_components/motion-system";
import type {
  PublicReport,
  SemaforoColor,
} from "~/server/marketplace/report-read";

/**
 * Cada color del semáforo, en sus tres papeles. Clases literales completas —
 * nada de componerlas con plantillas — para que Tailwind las vea en el código.
 */
const SEMAFORO: Record<
  SemaforoColor,
  { texto: string; fondo: string; borde: string }
> = {
  verde: {
    texto: "text-(--semaforo-ok)",
    fondo: "bg-(--semaforo-ok)",
    borde: "border-(--semaforo-ok)",
  },
  ambar: {
    texto: "text-(--semaforo-mid)",
    fondo: "bg-(--semaforo-mid)",
    borde: "border-(--semaforo-mid)",
  },
  rojo: {
    texto: "text-(--semaforo-no)",
    fondo: "bg-(--semaforo-no)",
    borde: "border-(--semaforo-no)",
  },
  gris: {
    texto: "text-(--semaforo-neutro)",
    fondo: "bg-(--semaforo-neutro)",
    borde: "border-(--semaforo-neutro)",
  },
};

/** El color de la línea del nivel. «A explorar» en neutro: aún no hay veredicto. */
const NIVEL_LINEA: Record<PublicReport["nivel"], string> = {
  listos: "bg-(--semaforo-ok)",
  casi: "bg-(--semaforo-mid)",
  explorar: "bg-(--semaforo-neutro)",
};

/** Y el color del rótulo que lleva la palabra al lado de esa línea. */
const NIVEL_ROTULO: Record<PublicReport["nivel"], string> = {
  listos: "text-(--semaforo-ok)",
  casi: "text-(--semaforo-mid)",
  explorar: "text-(--semaforo-neutro)",
};

/**
 * El titular cuando el informe no trae `titular` propio. Dice la oportunidad sin
 * los detalles del caso, que es lo único que un informe antiguo no puede saber.
 * Ninguno de los tres niveles es un no, y los tres empiezan por lo que se puede
 * hacer ya.
 */
const TITULAR_POR_NIVEL: Record<PublicReport["nivel"], string> = {
  listos: "Podemos empezar cuando queráis",
  casi: "Podemos empezar ya, con un alcance acotado",
  explorar: "Hay por dónde empezar, ya",
};

const CARD =
  "rounded-2xl border border-cyan-800/15 bg-white/80 shadow-big-blocks backdrop-blur-xs dark:border-cyan-300/15 dark:bg-[#152230e6]/90";

const FICHA =
  "rounded-xl border border-cyan-800/10 bg-white px-3.5 py-2.5 text-[13.5px] leading-snug font-semibold text-slate-800 dark:border-cyan-300/12 dark:bg-[#0b1a2b] dark:text-slate-100";

const ROTULO = "font-display text-[11px] font-bold tracking-[0.14em] uppercase";

const H2 =
  "font-display text-2xl font-bold tracking-tight text-[#05215e] dark:text-slate-50";

const LEDE =
  "font-body mt-2.5 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-400";

const FUERTE = "font-display font-bold text-[#05215e] dark:text-slate-100";

/**
 * Los usos fuera de alcance, en prosa y en una línea.
 *
 * El contrato los manda como lista y el diseño los quiere como frase. Se unen
 * como frases cortas —cada una con su punto— en vez de encadenarlas con «y»:
 * enlazarlas obligaría a bajar la primera letra de cada trozo, y no se puede
 * saber desde aquí si esa palabra es un nombre propio.
 */
function frase(items: readonly string[]) {
  return items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => (/[.!?]$/.test(item) ? item : `${item}.`))
    .join(" ");
}

export function InformeView({
  report,
  badgeDigits,
  url,
  fechaTexto,
}: {
  report: PublicReport;
  /** Últimos dígitos de la cuenta de AWS, o `null` sin cookie que lo pruebe. */
  badgeDigits: string | null;
  /** URL absoluta de esta página, para copiar y para el pie. */
  url: string;
  fechaTexto: string;
}) {
  const estructurado = report.dims.length > 0 && report.encaje !== undefined;
  const titular = report.titular ?? TITULAR_POR_NIVEL[report.nivel];

  return (
    <div className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
      {/* ── Banda 1: el suelo del hero del sitio ──────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-cyan-800/10 dark:border-cyan-300/15">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_35%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_35%,rgba(20,184,166,0.08)_72%,transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]"
        />
        <SignalField
          className="-top-24 h-[calc(100%+6rem)]"
          intensity="hero"
          opacity={0.8}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-28 pb-14 sm:px-8 lg:pt-32">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <div>
              <Eyebrow>Informe de idoneidad</Eyebrow>
              <p className="font-display mt-3 text-xl font-bold tracking-tight text-[#05215e] sm:text-2xl dark:text-slate-50">
                {report.institucion}
              </p>
            </div>
            <p className="font-body text-sm text-slate-500 dark:text-slate-400">
              {fechaTexto} · Evaluación de idoneidad de Consensus Salutis
            </p>
          </div>

          {/* La oportunidad, a tamaño de titular. */}
          <h1 className="font-display mt-7 max-w-[20em] text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-[44px] sm:leading-[1.1] dark:text-slate-50">
            {titular}
          </h1>

          {/* El nivel, entero pero compacto: el color con su palabra al lado. */}
          <div className="mt-6">
            <p className={`${ROTULO} ${NIVEL_ROTULO[report.nivel]}`}>
              Nivel de encaje · {report.nivelNombre}
            </p>
            <div
              aria-hidden="true"
              className={`mt-2.5 h-1 rounded-full ${NIVEL_LINEA[report.nivel]}`}
            />
          </div>

          <p className="font-body mt-5.5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
            {report.diagnostico}
          </p>

          {/* Dos acciones: la amarilla invita a no esperar los cinco días. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3.5">
            <a
              href={`mailto:${report.canalSoporte}`}
              className="dark:bg-secondary-dark focus-visible:outline-secondary-dark shadow-big-blocks font-body bg-secondary-light inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-bold text-[#06111f] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none"
            >
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.8}
                className="size-4"
              />
              Empezar la conversación
            </a>
            <CopyReportLink url={url} />
            {badgeDigits !== null && (
              <span className="text-primary-light dark:text-primary-dark inline-flex items-center gap-2 text-[13px] font-semibold">
                <ShieldCheck
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="size-4"
                />
                Suscripción de AWS Marketplace verificada · cuenta ····
                {badgeDigits}
              </span>
            )}
          </div>

          {/* Plazo y soporte, en la primera pantalla: los dos son requisito de AWS. */}
          <div
            className={`mt-7 grid gap-x-7 gap-y-4 px-5 py-4.5 sm:grid-cols-[1.2fr_1fr] sm:px-6 ${CARD}`}
          >
            <p className="font-body text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
              <strong className={FUERTE}>Siguientes pasos.</strong> Alguien del
              equipo lee este informe y os escribe en{" "}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                {report.plazoHabil}
              </strong>{" "}
              con su lectura y una propuesta para arrancar, que ya incluye el
              plan de esta página.
            </p>
            <p className="font-body text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
              <strong className={FUERTE}>Soporte.</strong> Os responde el equipo
              que mantiene la plataforma, en un día laborable:{" "}
              <a
                href={`mailto:${report.canalSoporte}`}
                className="text-primary-light dark:text-primary-dark dark:hover:text-primary-dark-lighter underline underline-offset-4 transition hover:text-cyan-800"
              >
                {report.canalSoporte}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {estructurado && report.encaje !== undefined ? (
        <>
          {/* ── Banda 2: panel — qué podemos hacer ────────────────────────── */}
          <section className="relative z-10 border-b border-cyan-800/10 bg-[#e8f2f7] px-5 py-13 sm:px-8 dark:border-cyan-300/15 dark:bg-[#081827]">
            <div className="mx-auto w-full max-w-6xl">
              <h2 className={H2}>Qué podemos hacer</h2>
              <p className={LEDE}>
                Lo que ya podéis usar hoy y lo que se abre al arrancar el
                proyecto. Nada de la segunda lista está descartado: cada uso
                lleva debajo la decisión que lo abre, y esa decisión la tomamos
                juntos durante el arranque.
              </p>

              {/* Dos listas HERMANAS, no un tablero: el filete de arriba dice de
                  cuál es cada una sin teñir el fondo. A 390px se apilan en este
                  orden — lo de hoy primero. */}
              <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
                <div className={`overflow-hidden ${CARD}`}>
                  <div aria-hidden="true" className="h-1 bg-(--semaforo-ok)" />
                  <div className="px-5 pt-4.5 pb-5">
                    <p className={`${ROTULO} text-(--semaforo-ok)`}>
                      Desde hoy
                    </p>
                    <p className="font-body mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                      Sin decidir nada más.
                    </p>
                    <ul className="mt-3.5 grid gap-2">
                      {report.encaje.dentro.map((uso) => (
                        <li key={uso} className={FICHA}>
                          {uso}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`overflow-hidden ${CARD}`}>
                  <div aria-hidden="true" className="h-1 bg-(--semaforo-mid)" />
                  <div className="px-5 pt-4.5 pb-5">
                    <p className={`${ROTULO} text-(--semaforo-mid)`}>
                      Al arrancar el proyecto
                    </p>
                    <p className="font-body mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                      Cada uso, con la decisión que lo abre debajo.
                    </p>
                    <ul className="mt-3.5 grid gap-3.5">
                      {report.encaje.pronto.map((entrada) => (
                        <li key={entrada.uso}>
                          <p className={FICHA}>{entrada.uso}</p>
                          <p className="font-body mt-1.5 pl-3.5 text-[12.5px] leading-5 text-slate-600 dark:text-slate-400">
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">
                              Lo abre:
                            </strong>{" "}
                            {entrada.puerta}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* En caja, lo de fuera tenía un peso que no tiene: va en una línea. */}
              {report.encaje.fuera.length > 0 && (
                <p className="font-body mt-5.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <strong className={FUERTE}>
                    Fuera del alcance, con o sin proyecto.
                  </strong>{" "}
                  {frase(report.encaje.fuera)}
                </p>
              )}
              {report.encaje.quien.length > 0 && (
                <p className="font-body mt-2.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <strong className={FUERTE}>Quién lo usaría.</strong>{" "}
                  {report.encaje.quien}
                </p>
              )}
            </div>
          </section>

          {/* ── Banda 3: papel — la primera fase, juntos ──────────────────── */}
          <section className="relative z-10 px-5 py-13 sm:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <h2 className={H2}>La primera fase, juntos</h2>
              <p className={LEDE}>
                El plan que irá dentro de la propuesta, en orden. Ningún paso
                hace falta traerlo hecho, y en cada uno está escrito qué ponemos
                nosotros.
              </p>

              {/* La ruta arranca ARRIBA en verde —dónde estáis hoy— y baja. La
                  columna de puntos sale recta por construcción: cada fila es una
                  rejilla cuya primera columna mide 20px, lo que ocupa un punto,
                  con el punto y su tramo de línea centrados dentro. El tramo de
                  cada fila es el que SALE de su punto; el último no dibuja
                  ninguno y la línea muere en el último punto. Los puntos van
                  RELLENOS, del color de su estado: en aro, el plan parecía una
                  lista de casillas sin marcar. */}
              <div className="mt-6 max-w-3xl">
                <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-4">
                  <div className="grid grid-rows-[auto_minmax(0,1fr)] justify-items-center pt-0.5">
                    <span
                      aria-hidden="true"
                      className="size-3.5 rounded-full bg-(--semaforo-ok)"
                    />
                    {report.pasos.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="w-0.5 bg-cyan-800/15 dark:bg-cyan-300/15"
                      />
                    )}
                  </div>
                  <div className={report.pasos.length > 0 ? "pb-6" : ""}>
                    <p className={`${ROTULO} text-(--semaforo-ok)`}>
                      Desde aquí · hoy
                    </p>
                    <p className="font-display mt-1.5 text-[17px] font-bold text-[#05215e] dark:text-slate-50">
                      {report.hoyCorto ?? "Lo que ya cumple, cumplido"}
                    </p>
                  </div>
                </div>

                {report.pasos.map((paso, index) => {
                  const ultimo = index === report.pasos.length - 1;
                  return (
                    <div
                      key={`${paso.dimension}-${paso.texto}`}
                      className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-4"
                    >
                      <div className="grid grid-rows-[auto_minmax(0,1fr)] justify-items-center pt-0.5">
                        <span
                          aria-hidden="true"
                          className={`size-3.5 rounded-full ${SEMAFORO[paso.color].fondo}`}
                        />
                        {!ultimo && (
                          <span
                            aria-hidden="true"
                            className="w-0.5 bg-cyan-800/15 dark:bg-cyan-300/15"
                          />
                        )}
                      </div>
                      <div className={ultimo ? "" : "pb-6"}>
                        <p
                          className={`${ROTULO} ${SEMAFORO[paso.color].texto}`}
                        >
                          {index + 1} · {paso.dimension}
                        </p>
                        <p className="font-body mt-1.5 text-[15px] leading-6 text-slate-800 dark:text-slate-200">
                          {paso.texto}
                        </p>
                        {paso.apoyo !== undefined && (
                          <p className="text-primary-light dark:text-primary-dark font-body mt-1.5 text-[13.5px] leading-6 font-semibold">
                            Nuestra parte · {paso.apoyo}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {report.pasos.length === 0 && (
                  <p className="font-body mt-3 pl-9 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    No hemos identificado trabajo previo: no hay más pasos que
                    dar antes de empezar.
                  </p>
                )}

                <p className="font-body mt-6.5 max-w-2xl border-t border-cyan-800/10 pt-4.5 text-[14.5px] leading-relaxed text-slate-600 dark:border-cyan-300/12 dark:text-slate-400">
                  <strong className={FUERTE}>
                    Este plan no lo hacéis solos.
                  </strong>{" "}
                  Va dentro de la propuesta como primera fase, con plazos y con
                  quién hace cada cosa. Definirlo es la primera sesión de
                  trabajo, no deberes para antes de la llamada.
                </p>
              </div>
            </div>
          </section>

          {/* ── Banda 4: panel — el semáforo, al final y como evidencia ───── */}
          <section className="relative z-10 border-t border-cyan-800/10 bg-[#e8f2f7] px-5 py-13 sm:px-8 dark:border-cyan-300/15 dark:bg-[#081827]">
            <div className="mx-auto w-full max-w-6xl">
              <h2 className={H2}>De dónde sale el nivel</h2>
              <p className={LEDE}>
                Las cinco cosas que mira la evaluación y que sostienen el nivel
                y el plan de arriba, cada una con su motivo explicado sin
                rodeos.
              </p>
              <ul className="mt-5 grid gap-x-11 md:grid-cols-2">
                {report.dims.map((dim) => (
                  <li
                    key={dim.dimension}
                    className="grid grid-cols-[12px_minmax(0,1fr)] gap-3 border-b border-cyan-800/10 py-4 dark:border-cyan-300/12"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-[7px] size-2.5 rounded-full ${SEMAFORO[dim.color].fondo}`}
                    />
                    <div>
                      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span className="font-display text-[15.5px] font-bold text-slate-800 dark:text-slate-100">
                          {dim.dimension}
                        </span>
                        <span
                          className={`${ROTULO} text-[10px] ${SEMAFORO[dim.color].texto}`}
                        >
                          {dim.estado}
                        </span>
                      </p>
                      <p className="font-body mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {dim.motivo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : (
        /* Sin tablero estructurado, el informe entero en prosa: dice lo mismo. */
        <section className="relative z-10 px-5 py-13 sm:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <Markdown>{report.reportMarkdown}</Markdown>
          </div>
        </section>
      )}

      {/* ── Pie del informe: banda profunda ───────────────────────────────── */}
      <section className="relative z-10 border-t border-cyan-800/10 bg-[#deedf3] px-5 py-9 sm:px-8 dark:border-cyan-300/15 dark:bg-[#030916]">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-body max-w-3xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            Primera valoración automatizada a partir de la entrevista. La
            decisión final es humana. En esta evaluación no se han tratado datos
            de salud de pacientes en ningún momento.
          </p>
          {/* La URL y la fecha, escritas: una captura tiene que identificarse sola. */}
          <p className="font-body mt-2 text-[13px] break-all text-slate-500 dark:text-slate-400">
            {url} · {fechaTexto}
          </p>
        </div>
      </section>
    </div>
  );
}
