/**
 * Vista de los tres niveles del informe con datos de ejemplo. SOLO desarrollo.
 *
 * Existe por el criterio de aceptación §6 de la issue #6 —«los tres niveles
 * renderizados y leídos, con el mismo cuidado visual»— y para poder revisar la
 * maqueta a 390 px y en tema oscuro sin fabricar una evaluación real cada vez.
 * Los datos son los del hospital de ejemplo del canvas de diseño (F′).
 *
 * En producción no existe: `notFound()` fuera de desarrollo, antes de mirar
 * nada. No lee cookie, no llama a Convex y el badge es fijo, porque aquí no hay
 * nada que probar — la decisión real vive en `awsBadgeDigits` y sus tests.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InformeView } from "~/app/_components/informe/informe-view";
import { PageShell } from "~/app/_components/site";
import type { PublicReport } from "~/server/marketplace/report-read";

export const metadata: Metadata = {
  title: "Informe de idoneidad · vista de diseño",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BASE = {
  assessmentId: "preview",
  institucion: "Hospital Universitario Ejemplo",
  completedAt: Date.UTC(2026, 7, 18),
  plazoHabil: "5 días laborables",
  canalSoporte: "marketplace@consensussalutis.com",
  reportMarkdown: "# Informe de idoneidad",
} satisfies Partial<PublicReport>;

const FIXTURES: Record<string, PublicReport> = {
  listos: {
    ...BASE,
    nivel: "listos",
    nivelNombre: "Listos para empezar",
    diagnostico:
      "Corpus gobernado, marco de datos cerrado y patrocinio de dirección. Se puede arrancar con un caso de uso acotado sin esperar a nada más.",
    dims: [
      ["Perfil institucional", "verde", "sin obstáculos", "Hospital público de tamaño medio, con doce especialidades. Es el perfil para el que está pensada la plataforma."],
      ["Corpus documental", "verde", "sin obstáculos", "Documentación propia, con revisión anual y un aprobador con nombre. Es lo que más ayuda y lo que menos veces está."],
      ["Caso de uso", "verde", "sin obstáculos", "El uso está decidido y también el perfil de profesional que lo va a consultar."],
      ["Datos y cumplimiento", "verde", "sin obstáculos", "Con delegado de protección de datos, comité de ética y el dato en la Unión Europea."],
      ["Encaje operativo", "verde", "sin obstáculos", "Patrocinio de dirección, horizonte de este año e identidad corporativa lista para conectar."],
    ].map(([dimension, color, estado, motivo]) => ({
      dimension: dimension!,
      color: color as PublicReport["dims"][number]["color"],
      estado: estado!,
      motivo: motivo!,
    })),
    pasos: [],
    encaje: {
      dentro: [
        "Consulta de protocolos · los servicios que decidáis",
        "Residentes con supervisión",
        "Fuentes visibles en cada respuesta",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        { uso: "Búsqueda sobre la historia clínica", puerta: "el expediente de datos se trate aparte" },
      ],
      fuera: [
        "Uso promocional o cara al público",
        "Decisión clínica sin un profesional que la valide",
      ],
      quien:
        "Adjuntos, jefes de servicio y residentes con supervisión, identificados con el directorio corporativo que ya usáis.",
    },
    hoyCorto: "Podéis arrancar en cuanto queráis",
  },
  casi: {
    ...BASE,
    nivel: "casi",
    nivelNombre: "Casi listos",
    diagnostico:
      "Tenéis el corpus, el caso de uso y el patrocinio. Lo que falta es el marco de datos y decidir quién aprueba el contenido: dos decisiones de gobierno, ninguna técnica.",
    dims: [
      ["Perfil institucional", "verde", "sin obstáculos", "Hospital público de tamaño medio, con doce especialidades. Es el perfil para el que está pensada la plataforma."],
      ["Corpus documental", "verde", "sin obstáculos", "Documentación propia, en formato aprovechable y con los derechos claros. Es el punto de partida que hace falta."],
      ["Caso de uso", "ambar", "con trabajo previo", "El uso está claro —consulta de protocolos en el punto de atención— pero no está decidido qué perfil de profesional lo consultará primero."],
      ["Datos y cumplimiento", "rojo", "requiere replantearse", "No hay delegado de protección de datos asignado a este proyecto, y la residencia del dato está sin cerrar por escrito."],
      ["Encaje operativo", "ambar", "con trabajo previo", "Hay patrocinio de dirección y un horizonte de este año; el equipo de TI todavía no tiene horas reservadas."],
    ].map(([dimension, color, estado, motivo]) => ({
      dimension: dimension!,
      color: color as PublicReport["dims"][number]["color"],
      estado: estado!,
      motivo: motivo!,
    })),
    pasos: [
      { dimension: "Datos y cumplimiento", color: "rojo", texto: "Asignar el delegado de protección de datos a este proyecto y dejar firmada la evaluación de impacto." },
      { dimension: "Datos y cumplimiento", color: "rojo", texto: "Cerrar por escrito dónde vive el dato y quién responde de él." },
      { dimension: "Caso de uso", color: "ambar", texto: "Decidir quién aprueba el contenido publicado y cada cuánto se revisa." },
      { dimension: "Encaje operativo", color: "ambar", texto: "Reservar horas del equipo de TI para la integración de identidad." },
    ],
    encaje: {
      dentro: [
        "Consulta de protocolos · medicina interna",
        "Consulta de protocolos · urgencias",
        "Fuentes visibles en cada respuesta",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        { uso: "Consulta sin supervisión · residentes", puerta: "quede decidido quién aprueba el contenido" },
        { uso: "Búsqueda sobre la historia clínica", puerta: "esté cerrado el marco de datos y asignado el DPO" },
      ],
      fuera: [
        "Uso promocional o cara al público",
        "Decisión clínica sin un profesional que la valide",
      ],
      quien:
        "Adjuntos y jefes de servicio, identificados con el directorio corporativo que ya usáis. Entre sesenta y ochenta personas para empezar, en dos servicios.",
    },
    hoyCorto: "Consulta de protocolos en dos servicios, ya",
  },
  explorar: {
    ...BASE,
    nivel: "explorar",
    nivelNombre: "A explorar",
    diagnostico:
      "El interés está claro. Lo que todavía no hay es documentación propia gobernada ni un caso de uso concreto, y de esas dos cosas depende todo lo demás.",
    dims: [
      ["Perfil institucional", "verde", "sin obstáculos", "Hospital público de tamaño medio, con doce especialidades. El perfil encaja sin reservas."],
      ["Corpus documental", "rojo", "requiere replantearse", "Los protocolos existen, pero viven en carpetas y correos: sin versión, sin fecha de revisión y sin nadie que los apruebe."],
      ["Caso de uso", "ambar", "con trabajo previo", "Hay una intención —consultar protocolos— pero no un servicio, ni un tipo de consulta, ni un perfil de usuario concretos."],
      ["Datos y cumplimiento", "ambar", "con trabajo previo", "Con delegado de protección de datos, pero sin comité de ética y sin decidir dónde vive el dato."],
      ["Encaje operativo", "rojo", "requiere replantearse", "Sin patrocinio de dirección y sin horas de TI. Es lo primero que hace falta, antes que cualquier decisión técnica."],
    ].map(([dimension, color, estado, motivo]) => ({
      dimension: dimension!,
      color: color as PublicReport["dims"][number]["color"],
      estado: estado!,
      motivo: motivo!,
    })),
    pasos: [
      { dimension: "Corpus documental", color: "rojo", texto: "Reunir los protocolos que ya se usan y decidir quién los aprueba y cada cuánto se revisan." },
      { dimension: "Encaje operativo", color: "rojo", texto: "Buscar patrocinio en dirección médica antes de comprometer horas del equipo de TI." },
      { dimension: "Caso de uso", color: "ambar", texto: "Elegir un servicio y un tipo de consulta con los que probar." },
      { dimension: "Datos y cumplimiento", color: "ambar", texto: "Cerrar dónde vive el dato y quién responde de él." },
    ],
    encaje: {
      dentro: [
        "Prueba con un puñado de vuestros protocolos",
        "Dos o tres personas de vuestro equipo",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        { uso: "Uso abierto a un servicio entero", puerta: "haya aprobador y versión del contenido" },
        { uso: "Consulta en el punto de atención", puerta: "haya patrocinio de dirección y horas de TI" },
      ],
      fuera: [
        "Uso promocional o cara al público",
        "Decisión clínica sin un profesional que la valide",
      ],
      quien:
        "Para la prueba, quien hoy mantiene los protocolos. Para el uso real está por decidir, y decidirlo es parte del trabajo de aquí abajo.",
    },
    hoyCorto: "Una prueba acotada con vuestros protocolos",
  },
};

export default async function InformePreviewPage({
  params,
}: {
  params: Promise<{ nivel: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { nivel } = await params;
  const report = FIXTURES[nivel];
  if (report === undefined) notFound();

  return (
    <PageShell>
      <main className="relative isolate">
        <InformeView
          report={report}
          badgeDigits={nivel === "explorar" ? null : "4471"}
          url={`https://consensussalutis.com/informe/preview-${nivel}`}
          fechaTexto="18 de agosto de 2026"
        />
      </main>
    </PageShell>
  );
}
