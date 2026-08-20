/**
 * Vista de los tres niveles del informe con datos de ejemplo. SOLO desarrollo.
 *
 * Existe por el criterio de aceptación §6 de la issue #6 —«los tres niveles
 * renderizados y leídos, con el mismo cuidado visual»— y para poder revisar la
 * maqueta a 390 px y en tema oscuro sin fabricar una evaluación real cada vez.
 * Los datos son los del hospital de ejemplo del canvas de diseño «Oportunidad»,
 * con los textos que el motor tiene que escribir (`titular` por nivel, `apoyo`
 * por paso y las puertas redactadas con nuestra parte): la maqueta se revisa con
 * el contenido definitivo, no con el de antes.
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

/** Lo fuera de alcance no depende del nivel: es el borde del producto. */
const FUERA = [
  "El uso promocional o de cara al público",
  "Cualquier decisión clínica sin un profesional que la valide",
];

const dims = (
  rows: Array<[string, PublicReport["dims"][number]["color"], string, string]>,
): PublicReport["dims"] =>
  rows.map(([dimension, color, estado, motivo]) => ({
    dimension,
    color,
    estado,
    motivo,
  }));

const pasos = (
  rows: Array<[PublicReport["pasos"][number]["color"], string, string, string]>,
): PublicReport["pasos"] =>
  rows.map(([color, dimension, texto, apoyo]) => ({
    color,
    dimension,
    texto,
    apoyo,
  }));

const FIXTURES: Record<string, PublicReport> = {
  listos: {
    ...BASE,
    nivel: "listos",
    nivelNombre: "Listos para empezar",
    titular: "Podemos empezar cuando queráis",
    diagnostico:
      "Tenéis la documentación ordenada y con quien la aprueba, el marco de datos cerrado y el respaldo de dirección. Se puede empezar con un caso de uso acotado, sin esperar a nada más.",
    dims: dims([
      [
        "Perfil institucional",
        "verde",
        "Cumple",
        "Hospital público de tamaño medio, con doce especialidades. Es el perfil para el que está pensada la plataforma.",
      ],
      [
        "Corpus documental",
        "verde",
        "Cumple",
        "Documentación propia, con revisión anual y un aprobador con nombre. Es lo que más ayuda y lo que menos veces está.",
      ],
      [
        "Caso de uso",
        "verde",
        "Cumple",
        "El uso está decidido, y también qué profesionales lo van a consultar.",
      ],
      [
        "Datos y cumplimiento",
        "verde",
        "Cumple",
        "Con delegado de protección de datos, comité de ética y el dato en la Unión Europea.",
      ],
      [
        "Encaje operativo",
        "verde",
        "Cumple",
        "Respaldo de dirección, horizonte de este año e identidad corporativa lista para conectar.",
      ],
    ]),
    pasos: pasos([
      [
        "verde",
        "Caso de uso",
        "Acotar el primer caso de uso a un servicio y un tipo de consulta.",
        "los criterios que usamos en otros arranques, aplicados juntos en una sesión.",
      ],
      [
        "verde",
        "Encaje operativo",
        "Conectar la identidad corporativa, para que cada consulta quede firmada por quien la hace.",
        "la guía de integración y acompañamiento a vuestro equipo de TI.",
      ],
      [
        "verde",
        "Corpus documental",
        "Cargar el corpus revisado y fijar cómo se aprueba cada cambio.",
        "la carga la hacemos nosotros; el circuito de aprobación queda montado la primera semana.",
      ],
    ]),
    encaje: {
      dentro: [
        "Consulta de protocolos · los servicios que decidáis",
        "Residentes con supervisión",
        "Fuentes visibles en cada respuesta",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        {
          uso: "Búsqueda sobre la historia clínica",
          puerta:
            "tratar aparte el expediente de datos. Lo preparamos juntos cuando toque.",
        },
      ],
      fuera: FUERA,
      quien:
        "Adjuntos, jefes de servicio y residentes con supervisión, con el directorio corporativo que ya usáis.",
    },
    hoyCorto: "Consulta de protocolos en los servicios que decidáis",
  },
  casi: {
    ...BASE,
    nivel: "casi",
    nivelNombre: "Casi listos",
    titular: "Podemos empezar ya, con dos servicios",
    diagnostico:
      "Tenéis el corpus, el caso de uso y el respaldo de dirección: hay proyecto. Quedan dos decisiones de gobierno, y las tomamos juntos al arrancar — ninguna es técnica y ninguna hace falta traerla resuelta.",
    dims: dims([
      [
        "Perfil institucional",
        "verde",
        "Cumple",
        "Hospital público de tamaño medio, con doce especialidades. Es el perfil para el que está pensada la plataforma.",
      ],
      [
        "Corpus documental",
        "verde",
        "Cumple",
        "Documentación propia, en un formato aprovechable y con los derechos claros. Es el punto de partida que hace falta.",
      ],
      [
        "Caso de uso",
        "ambar",
        "A medias",
        "El uso está claro —consultar protocolos en el punto de atención—, pero falta decidir qué profesionales lo usarán primero.",
      ],
      [
        "Datos y cumplimiento",
        "rojo",
        "Todavía no",
        "No hay delegado de protección de datos asignado al proyecto, y dónde vive el dato está sin cerrar por escrito.",
      ],
      [
        "Encaje operativo",
        "ambar",
        "A medias",
        "Hay respaldo de dirección y horizonte de este año; al equipo de TI aún no se le han reservado horas.",
      ],
    ]),
    pasos: pasos([
      [
        "rojo",
        "Datos y cumplimiento",
        "Nombrar al delegado de protección de datos del proyecto y firmar la evaluación de impacto.",
        "la plantilla de la evaluación, ya redactada, y una sesión de trabajo con vuestro DPO.",
      ],
      [
        "rojo",
        "Datos y cumplimiento",
        "Dejar por escrito dónde vive el dato y quién responde de él.",
        "nuestro marco de datos documentado, listo para revisarlo con vuestro equipo.",
      ],
      [
        "ambar",
        "Caso de uso",
        "Decidir quién aprueba el contenido que se publica y cada cuánto se revisa.",
        "el circuito editorial que usan otras instituciones, como punto de partida.",
      ],
      [
        "ambar",
        "Encaje operativo",
        "Reservar horas del equipo de TI para conectar la identidad corporativa.",
        "la estimación cerrada de esas horas: son días de trabajo, no meses.",
      ],
    ]),
    encaje: {
      dentro: [
        "Consulta de protocolos · medicina interna",
        "Consulta de protocolos · urgencias",
        "Fuentes visibles en cada respuesta",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        {
          uso: "Consulta sin supervisión para residentes",
          puerta:
            "decidir quién aprueba el contenido. Se decide en el arranque, partiendo de nuestro circuito editorial.",
        },
        {
          uso: "Búsqueda sobre la historia clínica",
          puerta:
            "cerrar el marco de datos y nombrar al DPO. Primera fase, con nuestra plantilla.",
        },
      ],
      fuera: FUERA,
      quien:
        "Adjuntos y jefes de servicio, con el directorio corporativo que ya usáis. Para empezar, entre sesenta y ochenta personas en dos servicios.",
    },
    hoyCorto: "Consulta de protocolos en dos servicios",
  },
  explorar: {
    ...BASE,
    nivel: "explorar",
    nivelNombre: "A explorar",
    titular: "Hay por dónde empezar, ya",
    diagnostico:
      "El perfil encaja y se puede empezar este mismo trimestre: una prueba pequeña con vuestros protocolos, sin datos de paciente. Lo que falta —ordenar la documentación y concretar el caso de uso— es justo lo primero que haríamos juntos.",
    dims: dims([
      [
        "Perfil institucional",
        "verde",
        "Cumple",
        "Hospital público de tamaño medio, con doce especialidades. El perfil encaja sin reservas.",
      ],
      [
        "Corpus documental",
        "rojo",
        "Todavía no",
        "Los protocolos existen, pero viven en carpetas y correos: sin versión, sin fecha de revisión y sin nadie que los apruebe.",
      ],
      [
        "Caso de uso",
        "ambar",
        "A medias",
        "Hay intención —consultar protocolos—, pero falta concretar el servicio, el tipo de consulta y quién lo usará.",
      ],
      [
        "Datos y cumplimiento",
        "ambar",
        "A medias",
        "Hay delegado de protección de datos, pero falta el comité de ética y decidir dónde vive el dato.",
      ],
      [
        "Encaje operativo",
        "rojo",
        "Todavía no",
        "Sin respaldo de dirección y sin horas de TI. Está en el plan de aquí abajo, con nuestro dossier para esa conversación.",
      ],
    ]),
    pasos: pasos([
      [
        "rojo",
        "Corpus documental",
        "Reunir los protocolos que ya usáis y decidir quién los aprueba y cada cuánto se revisan.",
        "el guion del inventario y una sesión con quien los mantiene hoy.",
      ],
      [
        "rojo",
        "Encaje operativo",
        "Conseguir el respaldo de dirección médica antes de comprometer horas de TI.",
        "el dossier para dirección y, si ayuda, vamos con vosotros a presentarlo.",
      ],
      [
        "ambar",
        "Caso de uso",
        "Elegir el servicio y el tipo de consulta con los que probar.",
        "criterios de elección y ejemplos de hospitales parecidos.",
      ],
      [
        "ambar",
        "Datos y cumplimiento",
        "Decidir dónde vive el dato y quién responde de él.",
        "nuestro marco de datos documentado, como base.",
      ],
    ]),
    encaje: {
      dentro: [
        "Prueba con un puñado de vuestros protocolos",
        "Dos o tres personas de vuestro equipo",
        "Sin datos de paciente en ningún punto",
      ],
      pronto: [
        {
          uso: "Uso abierto a un servicio entero",
          puerta:
            "que el contenido tenga versión y aprobador. Se deja montado en la primera fase, con nuestro guion.",
        },
        {
          uso: "Consulta en el punto de atención",
          puerta:
            "el respaldo de dirección y las horas de TI. Vamos con vosotros a esa conversación, con el dossier.",
        },
      ],
      fuera: FUERA,
      quien:
        "Para la prueba, quienes hoy mantienen los protocolos. Para el uso real se decide en la primera fase, juntos.",
    },
    hoyCorto: "Una prueba pequeña con vuestros protocolos",
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
