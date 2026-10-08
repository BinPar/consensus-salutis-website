// The same expert focus is shown during consultation (02) and synthesis (03).
export const processExpertInputs = [
  {
    detail: "Congestión cardíaca: ortopnea, crepitantes y edema periférico.",
    compact: "Disnea y edema: valorar congestión.",
  },
  {
    detail:
      "Revisar AINE, IECA/ARA-II y diuréticos por riesgo renal e hiperpotasemia.",
    compact: "Ibuprofeno: revisar el riesgo renal.",
  },
  {
    detail:
      "Valorar lesión renal aguda sobre ERC: creatinina, potasio y diuresis.",
    compact: "Revisar función renal, potasio y diuresis.",
  },
] as const;

// Sanitized capture of the user's actual consultation. No live backend calls.
export const processConsultation = {
  question:
    "Paciente de 68 años con diabetes tipo 2, hipertensión y enfermedad renal crónica. Presenta cansancio progresivo, falta de aire al esfuerzo y edema en ambas piernas, y toma ibuprofeno con frecuencia. ¿Cómo orientarías la valoración inicial, qué signos de alarma y pruebas considerarías, y cómo influyen sus enfermedades y la medicación en las decisiones?",
  source: "Consulta ejecutada en Consensus Salutis el 6 de octubre de 2026",
  elapsedMs: 35156,
  citationCount: 17,
  experts: [
    {
      slug: "cardiologia",
      name: "Cardiología",
      question:
        "Paciente de 68 años con diabetes tipo 2, hipertensión y enfermedad renal crónica, con cansancio progresivo, disnea de esfuerzo y edema bilateral, y uso frecuente de ibuprofeno. ¿Cómo orientarías la valoración inicial, signos de alarma y pruebas iniciales, considerando posible insuficiencia cardiaca y comorbilidades? Responde de forma clínica y accionable, indicando límites.",
      opinion:
        "**Conclusión útil:** el cuadro es compatible con posible insuficiencia cardíaca aguda o descompensación congestiva: disnea progresiva y edema periférico son signos concordantes, y el uso frecuente de ibuprofeno es un posible factor precipitante porque los AINE aumentan la retención hídrica. ⟦c62888⟧ ⟦c62a00⟧ Requiere valoración clínica presencial, especialmente por la enfermedad renal crónica, aunque el corpus no aporta ajustes diagnósticos o terapéuticos específicos para dicha comorbilidad.\n\n**Valoración inicial orientada a gravedad**\n\n- Buscar signos de congestión: taquipnea, taquicardia, crepitantes, ortopnea, disnea paroxística nocturna, ingurgitación yugular, derrame pleural, hepatomegalia y edema periférico. ⟦c62888⟧\n- Preguntar y explorar posibles desencadenantes: infección, isquemia miocárdica, fibrilación auricular u otras taquiarritmias/bradiarritmias, incumplimiento terapéutico o dietético, anemia y exposición a AINE. La infección puede acompañarse de fiebre, leucocitosis y PCR elevada; la anemia, de hemoglobina baja. ⟦c62a00⟧\n- Considerar fibrilación auricular con respuesta ventricular rápida si existe taquicardia o ritmo irregular, pues es un desencadenante frecuente de descompensación. ⟦c62888⟧ ⟦c62a00⟧\n\n**Prueba inicial respaldada por el corpus**\n\n- Solicitar radiografía de tórax, que es fundamental para orientar la disnea. Buscar cardiomegalia, redistribución vascular hacia campos superiores, líneas B de Kerley, edema intersticial o alveolar y derrame pleural. ⟦c6298f⟧\n- La radiografía también puede mostrar prótesis valvulares o marcapasos, si estuvieran presentes. ⟦c6298f⟧\n\n**Signos de alarma**\n\nLa presencia de hipoxemia progresiva pese a oxígeno de alto flujo, acidosis respiratoria progresiva o agotamiento respiratorio —taquipnea superior a 40 respiraciones por minuto— indica gravedad y puede requerir ventilación mecánica invasiva según los criterios del corpus. ⟦c62b09⟧ La ventilación mecánica no invasiva se plantea si no mejora o existe acidosis respiratoria, antes de la intubación. ⟦c62b09⟧ También debe considerarse especialmente urgente la hipotensión, definida en el corpus como presión arterial sistólica inferior a 90 mmHg, porque modifica la estrategia terapéutica. ⟦c62b09⟧\n\n**Límites:** el corpus no especifica biomarcadores, electrocardiograma, ecocardiograma, analítica renal/electrolítica ni criterios de ajuste por enfermedad renal crónica; por tanto, no los presento como pruebas protocolizadas basadas en esta fuente.",
      startedAfterMs: 0,
      durationMs: 8234,
      round: 1,
    },
    {
      slug: "farmacologia",
      name: "Farmacología",
      question:
        "Paciente de 68 años con diabetes tipo 2, hipertensión y enfermedad renal crónica, con cansancio progresivo, disnea de esfuerzo y edema bilateral, y consumo frecuente de ibuprofeno. ¿Cómo influye la medicación, especialmente AINEs, en la valoración y decisiones iniciales? ¿Qué revisar y qué signos de toxicidad o interacciones considerarías? Responde de forma clínica y accionable, indicando límites.",
      opinion:
        "Conclusión útil: el consumo frecuente de ibuprofeno es un factor farmacológico prioritario en este paciente con enfermedad renal crónica, edema y disnea. Debe revisarse de inmediato la necesidad del AINE y evitarlo en la insuficiencia renal; en ERC grave está contraindicado cuando el aclaramiento de creatinina es <30 mL/min. Si excepcionalmente fuera imprescindible, el corpus limita su uso a un AINE de vida media corta durante pocos días, con hidratación adecuada. ⟦c73b77⟧\n\n**Revisión inicial de la medicación**\n\n- Confirmar todos los fármacos, dosis, frecuencia, automedicación y productos sin receta; precisar el aclaramiento renal y los cambios recientes. En la insuficiencia renal, los fármacos de eliminación renal requieren reducción de dosis o ampliación del intervalo para evitar toxicidad. ⟦c73d65⟧\n- Buscar combinaciones de alto riesgo con ibuprofeno: IECA, ARA-II y diuréticos, que deben evitarse conjuntamente con AINE por el riesgo descrito en ERC. ⟦c73b77⟧ También deben evitarse los AINE en presencia concomitante de insuficiencia cardíaca, diabetes o hipertensión. ⟦c73b77⟧\n- Revisar diuréticos ahorradores de potasio —espironolactona, eplerenona o amilorida—, especialmente si se combinan con IECA/ARA-II o AINE, por el alto riesgo de hiperpotasemia. ⟦c73a7e⟧\n- Si recibe IECA o ARA-II, comprobar si se realizó control analítico a los 7-10 días de su inicio y vigilar potasio; el corpus advierte de riesgo de fracaso renal agudo. No se recomienda combinar IECA y ARA-II. ⟦c739f1⟧\n- Revisar antidiabéticos: la metformina está contraindicada con filtrado <30 mL/min/1,73 m² y requiere reducción al 50 % con filtrado de 30-45; las sulfonilureas son poco recomendables en ERC por hipoglucemias prolongadas. ⟦c737db⟧\n- Si usa digoxina, individualizar dosis según edad y ERC y monitorizar niveles y electrolitos, porque la insuficiencia renal es la causa más frecuente de intoxicación digitálica. ⟦c738f6⟧\n- Si recibe anticoagulación, revisar especialmente HBPM por acumulación renal y sangrado; pueden requerir reducción, monitorización anti-Xa o evitación con aclaramiento <30 mL/min. ⟦c736dc⟧\n\n**Toxicidad e interacciones a buscar**\n\nEl edema bilateral y la disnea obligan a valorar clínicamente una posible retención de líquidos o descompensación, pero el corpus no permite atribuirlos específicamente al ibuprofeno ni establecer un diagnóstico. Revisaría signos de empeoramiento renal, hiperpotasemia, hipotensión o fracaso renal agudo, además de sangrado si toma anticoagulantes. En una persona con cansancio y disnea, también debe considerarse toxicidad medicamentosa o acumulación por ERC, sin asumir causalidad sin datos analíticos y clínicos.\n\nLímite: el corpus no aporta un protocolo diagnóstico para esta presentación ni permite indicar pruebas concretas, una dosis alternativa de analgésico o suspender tratamientos esenciales sin conocer la medicación completa y la función renal. La disnea progresiva y el edema requieren valoración clínica prioritaria, especialmente si aparecen en reposo, empeoran rápidamente o se acompañan de deterioro general.",
      startedAfterMs: 751,
      durationMs: 8700,
      round: 1,
    },
    {
      slug: "nefrologia",
      name: "Nefrología",
      question:
        "Paciente de 68 años con diabetes tipo 2, hipertensión y enfermedad renal crónica, con cansancio progresivo, disnea de esfuerzo y edema bilateral, además de uso frecuente de ibuprofeno. ¿Cómo orientarías la valoración inicial, qué signos de alarma y pruebas considerarías, y cómo influyen la ERC y el ibuprofeno en las decisiones? Responde de forma clínica y accionable, indicando límites de evidencia.",
      opinion:
        "**La prioridad es descartar una descompensación de la ERC con sobrecarga de volumen, hiperpotasemia, acidosis, anemia o insuficiencia cardiaca, y suspender el ibuprofeno mientras se aclara la situación.** En la ERC avanzada pueden aparecer cansancio, disnea, edema, anemia, hiperpotasemia, acidosis y complicaciones cardiovasculares; el síndrome urémico puede incluir insuficiencia cardiaca, arritmias y pericarditis. ⟦c7b5cc⟧ ⟦c7b2d9⟧\n\n### Valoración inicial\n\n- Confirmaría evolución de la disnea y del edema, diuresis, aumento de peso, ingesta de sal y líquidos, síntomas urémicos —náuseas, vómitos, anorexia, prurito, alteración cognitiva— y exposición exacta a ibuprofeno y otros fármacos.\n- Buscaría datos de sobrecarga —edema, signos de edema agudo de pulmón—, hipertensión, arritmia, alteración del nivel de conciencia, pericarditis y signos de deshidratación o hipoperfusión. La sobrecarga de volumen y las alteraciones metabólicas son complicaciones reconocidas del fracaso renal agudo. ⟦c7bb6e⟧\n- Compararía creatinina, filtrado glomerular, potasio, bicarbonato y hemoglobina con resultados previos para distinguir progresión de ERC de un fracaso renal agudo sobre ERC. Un aumento de creatinina de al menos 0,3 mg/dL orienta a fracaso renal agudo. ⟦c7be7b⟧ ⟦c7bd7c⟧\n\n### Pruebas iniciales razonables\n\nSolicitaría hemograma, creatinina, urea, iones —incluido potasio—, bicarbonato, calcio, fósforo, magnesio, glucemia y albúmina; análisis de orina con sedimento y cuantificación de proteinuria/albuminuria. La proteinuria puede ayudar a valorar lesión glomerular y riesgo de progresión. ⟦c7c3cb⟧ ⟦c7b8ef⟧\n\nRealizaría un electrocardiograma ante cualquier hiperpotasemia, incluso leve; las alteraciones tóxicas incluyen ondas T picudas, prolongación del PR, ensanchamiento del QRS y progresión a asistolia. ⟦c7ca72⟧ Solicitaría radiografía de tórax si la clínica sugiere congestión pulmonar, aunque el corpus no establece criterios específicos para indicarla.\n\nSi existe deterioro agudo de función renal, la ecografía renal es la primera prueba para descartar obstrucción; si no hay dilatación, se valoran causas prerrenales, parenquimatosas o farmacológicas. ⟦c7bd7c⟧ Según sedimento y evolución podrían considerarse autoinmunidad, estudio de proteínas monoclonales y biopsia, pruebas contempladas en la evaluación del fracaso renal agudo. ⟦c7bd7c⟧\n\n### Signos de alarma\n\nDerivaría a valoración urgente por disnea en reposo o edema agudo de pulmón, hiperpotasemia con cambios electrocardiográficos, acidosis grave, anuria/oliguria marcada, encefalopatía, pericarditis, arritmias o sobrecarga de volumen refractaria. Son indicaciones absolutas de tratamiento renal sustitutivo en el fracaso renal agudo la sobrecarga refractaria con edema pulmonar, la hiperpotasemia tóxica, la acidosis extrema y los síntomas urémicos. ⟦c7bb6e⟧\n\n### Papel del ibuprofeno y límites\n\nEl ibuprofeno puede reducir el filtrado al inhibir prostaglandinas y causar vasoconstricción aferente, especialmente en hipoperfusión; también se asocia a fracaso renal prerrenal, necrosis tubular, nefritis tubulointersticial aguda y proteinuria por cambios mínimos. ⟦c7d2a7⟧ ⟦c7da19⟧ Debe suspenderse inicialmente y revisarse toda la medicación nefrotóxica, pero el corpus no permite establecer por sí solo si el deterioro es atribuible exclusivamente al ibuprofeno ni definir un esquema alternativo de analgesia. La estrategia antihipertensiva y diurética debe individualizarse según potasio, filtrado, volumen y presión arterial; no asumiría que el edema es exclusivamente renal sin valorar causas cardiovasculares y otras etiologías.",
      startedAfterMs: 1309,
      durationMs: 13455,
      round: 1,
    },
  ],
} as const;

export const processFollowup = {
  question:
    "¿Qué información adicional necesitas para precisar la valoración y revisar la medicación?",
  finalOpinion:
    "La disminución de la diuresis, la sobrecarga de volumen, la hiperpotasemia, la acidosis y los síntomas urémicos son datos especialmente relevantes. El edema pulmonar refractario, la hiperpotasemia tóxica, la acidosis extrema o la encefalopatía/pericarditis urémica requieren valoración urgente y pueden constituir indicaciones de tratamiento renal sustitutivo. ⟦c7bb6e⟧\n\nSi existe hiperpotasemia, debe conocerse si hay alteraciones electrocardiográficas, ya que constituyen una emergencia y justifican realizar un ECG incluso cuando la cifra de potasio no parezca muy elevada. ⟦c7ca72⟧\n\nTambién preguntaría por dolor torácico, síntomas infecciosos y palpitaciones o ritmo irregular, para valorar isquemia, infección o arritmia como posibles desencadenantes de una descompensación cardiaca. ⟦c62888⟧ ⟦c62a00⟧\n\nCompararía los valores actuales con los previos. Un aumento de creatinina de al menos 0,3 mg/dL en 48 horas o de al menos el 50 % en 7 días cumple criterio de fracaso renal agudo según KDIGO. ⟦c7bf72⟧ En un fracaso renal agudo debe considerarse inicialmente una ecografía renal para descartar obstrucción. ⟦c7bd7c⟧\n\nLa conciliación debe incluir tratamientos para diabetes, hipertensión, dolor y edema, además de medicamentos “a demanda”, preparados para resfriado, antiácidos, laxantes, suplementos, plantas y productos adquiridos sin receta o por internet. En la ERC, los fármacos con eliminación renal pueden requerir reducción de dosis o ampliación del intervalo. ⟦c73d65⟧\n\nLos AINE pueden reducir el filtrado por vasoconstricción aferente; deben evitarse en la ERC y especialmente si se combinan con IECA/ARA-II o diuréticos. ⟦c73b77⟧ ⟦c7d2a7⟧\n\nLos IECA/ARA-II pueden elevar el potasio y reducir el filtrado, sobre todo en hipoperfusión; requieren control analítico y deben revisarse si aparece fracaso renal agudo o hiperpotasemia. ⟦c7b3de⟧ Los ahorradores de potasio requieren especial cautela en la insuficiencia renal, y no se aconseja combinar IECA y ARA-II. ⟦c73a7e⟧ ⟦c739f1⟧\n\nSi toma digoxina, solicitaría dosis, horario, última toma, niveles disponibles, electrolitos y síntomas de toxicidad, dado que la insuficiencia renal obliga a individualizar la dosis y el intervalo. ⟦c738f6⟧",
  citations: [
    {
      anchor: "c7bb6e",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c7ca72",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c62888",
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
    },
    {
      anchor: "c62a00",
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
    },
    {
      anchor: "c7bf72",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c7bd7c",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c73d65",
      expert: "farmacologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c73b77",
      expert: "farmacologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c7d2a7",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c7b3de",
      expert: "nefrologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c73a7e",
      expert: "farmacologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c739f1",
      expert: "farmacologia",
      source: "promir-nefrologia.md",
    },
    {
      anchor: "c738f6",
      expert: "farmacologia",
      source: "promir-nefrologia.md",
    },
  ],
} as const;
export const processResult = {
  finalOpinion:
    "El cuadro requiere **valoración presencial prioritaria**, porque puede corresponder a una descompensación congestiva/insuficiencia cardiaca, una sobrecarga de volumen por empeoramiento de la ERC, un fracaso renal agudo sobre ERC, hiperpotasemia, anemia o una combinación de estos procesos. ⟦c62888⟧ ⟦c7b5cc⟧ El ibuprofeno es un posible factor precipitante, al favorecer retención hídrica y deterioro del filtrado. ⟦c62888⟧ ⟦c7d2a7⟧\n\n- Precisaría la evolución de la disnea y el edema, presencia de ortopnea o disnea paroxística nocturna, aumento de peso, reducción de la diuresis, ingesta de sal y líquidos, y síntomas urémicos como náuseas, vómitos, anorexia, prurito o alteración cognitiva. ⟦c7b5cc⟧\n- Exploraría signos de congestión: taquipnea, taquicardia, crepitantes, ingurgitación yugular, derrame pleural, hepatomegalia y edema periférico. También buscaría arritmia, hipertensión o hipotensión, hipoperfusión, deshidratación, pericarditis y edema agudo de pulmón. ⟦c62888⟧ ⟦c7bb6e⟧\n- Revisaría todos los medicamentos, incluidos los de venta libre, dosis, frecuencia y cambios recientes. Debe suspenderse inicialmente el ibuprofeno mientras se aclara la situación, y revisarse la exposición a otros nefrotóxicos. ⟦c73b77⟧ ⟦c73d65⟧ ⟦c7d2a7⟧\n- Es especialmente importante conocer la función renal previa y comparar con la actual para diferenciar progresión de ERC de fracaso renal agudo sobre ERC. Un aumento de creatinina de al menos 0,3 mg/dL orienta a fracaso renal agudo. ⟦c7be7b⟧ ⟦c7bd7c⟧\n\n- Hemograma, creatinina, urea, filtrado glomerular, iones con potasio, bicarbonato, calcio, fósforo, magnesio, glucemia y albúmina. ⟦c7c3cb⟧\n- Análisis de orina con sedimento y cuantificación de proteinuria o albuminuria. ⟦c7c3cb⟧ ⟦c7b8ef⟧\n- Electrocardiograma, especialmente si existe hiperpotasemia o sospecha de arritmia. Las alteraciones por hiperpotasemia pueden incluir ondas T picudas, prolongación del PR y ensanchamiento del QRS. ⟦c7ca72⟧\n- Radiografía de tórax para valorar cardiomegalia, redistribución vascular, líneas B de Kerley, edema intersticial o alveolar y derrame pleural. ⟦c6298f⟧\n- Si hay deterioro agudo de la función renal, ecografía renal para descartar obstrucción; si no existe dilatación, deben valorarse causas prerrenales, parenquimatosas o farmacológicas. ⟦c7bd7c⟧\n\nLa revisión cardiológica debe mantenerse activa: no debe atribuirse el edema exclusivamente a la ERC, ya que la disnea progresiva y el edema son compatibles con descompensación cardiaca, y la fibrilación auricular u otras arritmias, la isquemia, la infección, la anemia o la falta de adherencia pueden actuar como desencadenantes. ⟦c62888⟧ ⟦c62a00⟧\n\n- Disnea en reposo, hipoxemia progresiva, agotamiento respiratorio o taquipnea marcada.\n- Edema agudo de pulmón o sobrecarga de volumen que no responde a las medidas iniciales.\n- Hipotensión, alteración del nivel de conciencia o deterioro general.\n- Oliguria marcada o anuria.\n- Hiperpotasemia, especialmente con alteraciones electrocardiográficas.\n- Acidosis grave, arritmias, pericarditis o síntomas urémicos importantes. ⟦c62b09⟧ ⟦c7bb6e⟧\n\nLa sobrecarga refractaria con edema pulmonar, la hiperpotasemia tóxica, la acidosis extrema y los síntomas urémicos son indicaciones absolutas de tratamiento renal sustitutivo en el fracaso renal agudo. ⟦c7bb6e⟧\n\nEl ibuprofeno puede reducir el filtrado mediante vasoconstricción aferente y asociarse a fracaso renal prerrenal, necrosis tubular, nefritis tubulointersticial aguda o proteinuria. ⟦c7d2a7⟧ ⟦c7da19⟧ Debe evitarse en la ERC grave cuando el aclaramiento de creatinina es inferior a 30 ml/min, y también en presencia de insuficiencia cardiaca, diabetes o hipertensión. ⟦c73b77⟧\n\nHay que revisar especialmente la combinación de AINE con IECA o ARA-II y diuréticos, por el riesgo de deterioro renal; asimismo, los diuréticos ahorradores de potasio combinados con IECA/ARA-II o AINE aumentan el riesgo de hiperpotasemia. ⟦c73b77⟧ ⟦c73a7e⟧ Si recibe IECA o ARA-II, debe comprobarse el potasio y la función renal; no se recomienda combinar IECA y ARA-II. ⟦c739f1⟧",
  citations: [
    {
      anchor: "c62888",
      order: 1,
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
      quote:
        "La ICA ([Cardiología, Insuficiencia cardíaca](/capitulo/570779c8f4d68bf008dbc6b4#58999992b89214740aff8b88)) abarca todos aquellos estados en los que el corazón no es capaz de bombear la sangre que el organismo necesita en un momento determinado (gasto cardíaco inferior a las necesidades metabólicas).",
    },
    {
      anchor: "c7b5cc",
      order: 2,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote: "##### Síndrome urémico. Afectación por órganos y sistemas",
    },
    {
      anchor: "c7d2a7",
      order: 3,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "El movimiento del líquido o filtración glomerular a través del glomérulo se rige por las leyes de Starling y es proporcional a la permeabilidad de la membrana y al equilibrio entre los gradientes de presión hidráulica (que favorece la salida de líquido) y oncótica (que impide la salida de líquido).",
    },
    {
      anchor: "c7bb6e",
      order: 4,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "El tratamiento de cualquier FRA se basa en actuar de la forma más precoz posible sobre la causa desencadenante.",
    },
    {
      anchor: "c73b77",
      order: 5,
      expert: "farmacologia",
      source: "promir-nefrologia.md",
      quote: "**Se debe evitar el uso de AINE en la insuficiencia renal.",
    },
    {
      anchor: "c73d65",
      order: 6,
      expert: "farmacologia",
      source: "promir-nefrologia.md",
      quote:
        "El ajuste de dosis en la insuficiencia renal es imprescindible para evitar la toxicidad de fármacos con eliminación renal y procurar su adecuada eficacia.",
    },
    {
      anchor: "c7be7b",
      order: 7,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "La IRA prerrenal habitualmente es oligúrica y presenta una orina muy concentrada (sodio en orina bajo, con osmolaridad urinaria elevada).",
    },
    {
      anchor: "c7bd7c",
      order: 8,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "En todo paciente con IRA lo primero que se debe realizar es una ecografía renal para descartar causa obstructiva.",
    },
    {
      anchor: "c7c3cb",
      order: 9,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "En condiciones normales la excreción normal de proteínas en orina es de 80 mg/24 horas, de las cuales hasta 30 mg corresponden a albúmina y el resto son proteínas procedentes de células tubulares (proteínas de Tamm-Horsfall) y proteínas de bajo peso molecular.",
    },
    {
      anchor: "c7b8ef",
      order: 10,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "** Se define por un descenso sostenido superior a 5 mL/min/año descartándose previamente causas reversibles como uropatía obstructiva, depleción de volumen, hipoperfusión renal o empleo de fármacos nefrotóxicos (antiinflamatorios no esteroideos, contrastes yodados, etc.",
    },
    {
      anchor: "c7ca72",
      order: 11,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "** Se define como la concentración de potasio sérico superior a 5,5 mEq/L.",
    },
    {
      anchor: "c6298f",
      order: 12,
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
      quote:
        "Para el **diagnóstico** (****)de la ICA solicitarás estudio radiológico, donde podrás encontrar ( y ):",
    },
    {
      anchor: "c62a00",
      order: 13,
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
      quote:
        "</recuerda> Es importante conocer cuáles son los factores precipitantes de una ICA, porque en ocasiones te solicitarán su identificación: Causas cardíacas: taquiarritmias o bradiarritmias, isquemia miocárdica, fármacos inotrópicos negativos (antagonistas del calcio, β-bloqueantes, etc.",
    },
    {
      anchor: "c62b09",
      order: 14,
      expert: "cardiologia",
      source: "promir-radiologia-urgencias.md",
      quote:
        "En cuanto al **tratamiento** (**; **), debes plantearte los siguientes **objetivos:**",
    },
    {
      anchor: "c7da19",
      order: 15,
      expert: "nefrologia",
      source: "promir-nefrologia.md",
      quote:
        "Las nefropatías tubulointersticiales agudas (NTIA) causan una reacción inflamatoria aguda del espacio intersticial caracterizada por edema intersticial, infiltrados inflamatorios y áreas de necrosis de células tubulares.",
    },
    {
      anchor: "c73a7e",
      order: 16,
      expert: "farmacologia",
      source: "promir-nefrologia.md",
      quote:
        "##### Diuréticos Se deben evitar los diuréticos ahorradores de potasio (espironolactona, eplerenona, amilorida) en pacientes con insuficiencia renal y, sobre todo, no asociarlos con IECA, ARA-II o AINE (alto riesgo de hiperpotasemia).",
    },
    {
      anchor: "c739f1",
      order: 17,
      expert: "farmacologia",
      source: "promir-nefrologia.md",
      quote:
        "##### Hipotensores IECA y ARA-II: son renoprotectores, no están contraindicados en la insuficiencia renal, pero en etapas avanzadas pueden requerir disminución de la dosis.",
    },
  ],
  evidence: {
    anchor: "c73b77",
    referenceIndex: 5,
    source: "promir-nefrologia.md",
    quote: "**Se debe evitar el uso de AINE en la insuficiencia renal.",
    relation: "derived-from",
    unit: "#### AINE\n\n<redFlag>Se debe evitar el uso de AINE en la insuficiencia renal; con ERC grave (aclaramiento de creatinina < 30 mL/min) están siempre contraindicados.</redFlag> Si son estrictamente necesarios, es preferible emplear AINE de vida media corta durante pocos días, asegurando una correcta hidratación. Se evitarán en insuficiencia cardíaca, diabetes e hipertensión concomitantes, y no deben asociarse a IECA, ARA-II ni diuréticos.",
  },
} as const;
