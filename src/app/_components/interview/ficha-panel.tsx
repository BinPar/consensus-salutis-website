"use client";

/**
 * El panel de la ficha: una impresión en vivo de lo que se ha entendido.
 *
 * ## El panel enseña; el informe registra
 *
 * El panel intentaba ser las dos cosas y por eso acababa siendo una tabla de
 * veintiocho filas con un contador de huecos. Un registro completo tiene sentido
 * en un documento que alguien se guarda y reenvía a su comité — no en una columna
 * de 23rem que se mira de reojo mientras se contesta. Aquí van tres capas con
 * pesos distintos:
 *
 * 1. **El arco**, que dice por dónde va la conversación en quintos.
 * 2. **Tres cifras**, que es lo único que se ve desde lejos.
 * 3. **Cinco rasgos**, uno por bloque, telegráficos y con la palabra decisiva en
 *    el acento.
 *
 * Ocho unidades de lectura en el peor caso, contra las veintiocho de antes.
 *
 * ## Es de SOLO LECTURA, y eso es el diseño
 *
 * No hay editor en línea, y no es una carencia: un panel con veintiocho botones de
 * edición no es un espejo de la conversación, es un segundo formulario al lado del
 * primero. La corrección va donde ya está la conversación — se dice en el chat.
 *
 * Lo que sostiene esa decisión no está aquí, está en Convex: `actualizarFicha`
 * acepta `esCorreccion`, y una anotación marcada así se guarda con
 * `origen: "usuario"`. A partir de ahí el propio agente no puede pisarla, que es
 * exactamente la garantía que antes solo daba el endpoint `correccion`. Sin eso,
 * retirar el editor habría dejado al cliente sin ninguna forma de que una
 * corrección suya aguantara dos turnos.
 *
 * `parseFichaInput` y `toInputValue` se quedan en `~/lib/ficha`, y
 * `correctFichaField` en `~/lib/interview`: son la vía de escape si la corrección
 * por chat no cuaja, y borrarlas costaría más que dejarlas.
 *
 * ## Lo que ya no se enseña, y por qué
 *
 * No hay ningún denominador que el cliente no pueda cerrar. `0 de 28 campos`
 * se leía como una deuda de veintiocho y además era incerrable: un cierre real
 * deja cinco o seis campos sin valor. Tampoco hay contadores por bloque, ni el
 * desplegable de «N sin recoger» —que anunciaba lo que escondía—, ni una fila
 * «Sin recoger»: un campo sin valor simplemente no aparece, y un bloque no se
 * pinta hasta tener su campo pivote.
 *
 * Y sigue sin haber banderas, ni nivel, ni reglas del motor. Ese filtro está
 * aguas arriba, en `~/lib/interview`, así que aquí no hay nada que ocultar.
 */

import { motion, useReducedMotion } from "framer-motion";

import { FichaArco, fraseTurnos } from "~/app/_components/interview/ficha-arco";
import {
  countFilledFields,
  fichaCell,
  fichaFieldByPath,
  type Ficha,
} from "~/lib/ficha";
import {
  avanceDeBloques,
  cifras,
  contarDudas,
  rasgos,
  type Rasgo,
  type RasgoFragment,
} from "~/lib/ficha-rasgos";

export type FichaPanelProps = {
  ficha: Ficha;
  /** Paths (`bloque.campo`) que acaban de cambiar. Se resaltan un momento. */
  highlighted: ReadonlySet<string>;
  /** Cuántos turnos le quedan al agente. Nunca se escribe: da la frase suave. */
  turnosRestantes: number;
  /** La entrevista ha cerrado: la ficha se congela y el arco lo dice. */
  cerrada: boolean;
  /**
   * La ficha ya no admite cambios, así que el pie no invita a corregir: con la
   * entrevista cerrada no hay nadie al otro lado a quien decírselo.
   */
  readOnly?: boolean;
};

export function FichaPanel({
  ficha,
  highlighted,
  turnosRestantes,
  cerrada,
  readOnly = false,
}: FichaPanelProps) {
  const reducedMotion = useReducedMotion() ?? false;

  const { cerrados, actual } = avanceDeBloques(ficha);
  const tresCifras = cifras(ficha);
  const cincoRasgos = rasgos(ficha);
  const dudas = contarDudas(ficha);
  const recogidos = countFilledFields(ficha);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-cyan-800/12 px-5 py-4 dark:border-cyan-300/12">
        <p className="text-primary-light font-display dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase">
          Lo que hemos entendido
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/* El arco, con la frase suave del avance al lado. */}
        <div className="grid grid-cols-[auto_1fr] items-center gap-3.5 border-b border-cyan-800/12 pb-3.5 dark:border-cyan-300/12">
          <FichaArco cerrados={cerrados} actual={actual} cerrada={cerrada} />
          <div className="min-w-0">
            <p className="font-display text-[12.5px] leading-tight font-bold text-[#05215e] dark:text-slate-50">
              {cerrada ? "Evaluación cerrada" : fraseTurnos(turnosRestantes)}
            </p>
            <p className="font-body mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
              {cerrada
                ? "La ficha queda tal y como quedó la conversación."
                : "Se va escribiendo mientras hablamos."}
            </p>
          </div>
        </div>

        {recogidos === 0 ? (
          /*
            Un solo estado vacío, a nivel de panel. Antes había cinco —uno por
            bloque— y cinco veces «no hay nada» es una queja; una vez, con la
            expectativa de lo que va a pasar, es una explicación.
          */
          <p className="font-body mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Todavía no hay nada aquí. En dos o tres respuestas empezarás a ver tu
            caso tomando forma.
          </p>
        ) : (
          <>
            {tresCifras.length > 0 ? (
              <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] gap-2">
                {tresCifras.map((cifra) => (
                  <motion.div
                    key={cifra.path}
                    initial={{ opacity: reducedMotion ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className={`rounded-[11px] border px-2.5 py-2.5 ${
                      highlighted.has(cifra.path)
                        ? "border-primary-light/40 dark:border-primary-dark/40 bg-primary-light/8 dark:bg-primary-dark/10"
                        : "border-cyan-800/15 bg-white/70 dark:border-cyan-300/15 dark:bg-white/4"
                    } ${reducedMotion ? "" : "transition-colors duration-700"}`}
                  >
                    <span className="text-primary-light font-display dark:text-primary-dark block text-[19px] leading-none font-bold tabular-nums">
                      {cifra.valor}
                    </span>
                    <span className="font-body mt-1 block text-[9px] leading-tight text-slate-500 dark:text-slate-400">
                      {cifra.etiqueta}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 grid gap-2">
              {cincoRasgos.map((rasgo) => (
                <RasgoLine
                  key={rasgo.block}
                  rasgo={rasgo}
                  ficha={ficha}
                  highlighted={highlighted}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>

            {dudas > 0 ? (
              /*
                Enunciativa, sin pregunta y sin botón: el panel señala y el chat
                recoge. Cuenta sobre los 28 campos y no sobre los que se pintan,
                porque un campo de confianza baja que no sale en ningún rasgo no
                tiene sitio donde marcarse — es el límite conocido del diseño.

                Y con el panel de solo lectura, una pregunta que no puede recoger
                respuesta sería una promesa falsa.
              */
              <p className="font-body mt-3 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {dudas === 1 ? "1 dato" : `${dudas} datos`}
                </span>{" "}
                {dudas === 1
                  ? "del que no estamos seguros."
                  : "de los que no estamos seguros."}
              </p>
            ) : null}

            {cerrada ? (
              <p className="font-body mt-2 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                Los{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {recogidos} datos
                </span>{" "}
                recogidos van completos en tu informe.
              </p>
            ) : null}
          </>
        )}
      </div>

      {/*
        El pie: todo el modelo de interacción del panel, en seis palabras. Va aquí
        y no como un botón porque el sitio donde se corrige ya existe y está al
        lado — es el mismo campo en el que se está contestando.
      */}
      {readOnly ? null : (
        <div className="shrink-0 border-t border-cyan-800/12 px-5 py-3 dark:border-cyan-300/12">
          <p className="font-body text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
            ¿Algo no encaja? Dímelo y lo corrijo.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Un rasgo, con sus dos marcas.
 *
 * Al no haber una etiqueta por campo, los dos estados que importan se marcan
 * dentro de la frase: el fragmento **deducido** lleva subrayado punteado en el
 * color de contraste, y el **corregido por el cliente** va en negrita de acento
 * con una coletilla al final del rasgo.
 *
 * Confianza alta y media no se marcan. Marcar tres niveles es un semáforo, y los
 * semáforos están descartados por diseño en esta pantalla.
 */
function RasgoLine({
  rasgo,
  ficha,
  highlighted,
  reducedMotion,
}: {
  rasgo: Rasgo;
  ficha: Ficha;
  highlighted: ReadonlySet<string>;
  reducedMotion: boolean;
}) {
  const marcado = rasgo.fragments.map((fragment) => marcaDe(ficha, fragment));
  const corregido = marcado.some((marca) => marca === "usuario");
  const reciente = rasgo.fragments.some(
    (fragment) => fragment.path !== undefined && highlighted.has(fragment.path),
  );

  return (
    <motion.p
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      /*
        El resaltado es un fondo que se desvanece. Con `prefers-reduced-motion` no
        se desvanece: se queda puesto mientras dure y desaparece de golpe. Sigue
        diciendo lo mismo —«esto acaba de cambiar»— sin animar nada.
      */
      className={`grid grid-cols-[5px_1fr] items-baseline gap-2.5 rounded-md py-0.5 text-xs leading-normal text-slate-800 dark:text-slate-100 ${
        reciente ? "bg-primary-light/8 dark:bg-primary-dark/10" : ""
      } ${reducedMotion ? "" : "transition-colors duration-700"}`}
    >
      <span
        aria-hidden="true"
        className="bg-primary-light dark:bg-primary-dark mt-1.5 block size-[5px] rounded-full"
      />
      <span className="font-body min-w-0">
        {rasgo.fragments.map((fragment, index) => (
          <FragmentSpan
            key={`${rasgo.block}-${index}`}
            fragment={fragment}
            marca={marcado[index]!}
          />
        ))}
        {corregido ? (
          <span className="text-primary-light dark:text-primary-dark ml-1 text-[9px] font-bold whitespace-nowrap">
            · lo corregiste tú
          </span>
        ) : null}
      </span>
    </motion.p>
  );
}

/** Qué marca le toca a un fragmento: la del cliente gana a la de la deducción. */
type Marca = "usuario" | "deducido" | "decisivo" | null;

function marcaDe(ficha: Ficha, fragment: RasgoFragment): Marca {
  if (fragment.path === undefined) return null;

  const spec = fichaFieldByPath(fragment.path);
  const cell = spec === undefined ? undefined : fichaCell(ficha, spec);

  if (cell?.origen === "usuario") return "usuario";
  if (cell?.confianza === "baja") return "deducido";
  return fragment.decisive === true ? "decisivo" : null;
}

function FragmentSpan({
  fragment,
  marca,
}: {
  fragment: RasgoFragment;
  marca: Marca;
}) {
  if (marca === "usuario" || marca === "decisivo") {
    return (
      <span className="text-primary-light dark:text-primary-dark font-semibold">
        {fragment.text}
      </span>
    );
  }

  if (marca === "deducido") {
    return (
      <span
        title="Esto lo hemos deducido. Dímelo si no es así."
        className="border-b-[1.5px] border-dotted border-amber-600/50 dark:border-yellow-200/50"
      >
        {fragment.text}
      </span>
    );
  }

  return <>{fragment.text}</>;
}
