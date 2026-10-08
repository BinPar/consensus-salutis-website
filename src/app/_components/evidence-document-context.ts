// Document context supplied for mock 04, preserving the source wording.
export const evidenceDocumentContext = {
  nephropathies: [
    "Nefropatía por ácido úrico: la hiperuricemia crónica provoca depósitos de ácido úrico y sales de urato en el intersticio y los túbulos. Son frecuentes los episodios recurrentes de pielonefritis. Se asocia a HTA e hiperlipidemia. El tratamiento se basa en el alopurinol.",
    "Nefropatía hipercalcémica: infiltrados por monocitos con fibrosis intersticial y depósito de calcio en el intersticio (nefrocalcinosis), glomérulos y vasos. Se caracteriza por incapacidad para concentrar la orina y acidosis tubular distal con pérdida de potasio y sodio.",
    "Nefropatía de los Balcanes: nefropatía endémica de los países de Europa de Este. Aunque no está aclarada su etiología, se sospechan factores medioambientales (virus, toxinas de plantas, hidrocarburos, etc.) sobre una base de predisposición genética. Últimamente se cree que pueda ser debida a un componente vegetal, el ácido aristolóquico. Presenta una altísima incidencia de tumores endoteliales. Conduce a la ERC terminal entre los 30-50 años.",
    "Nefropatía por oxalato: aparece en aquellos procesos que cursan con aumento de la excreción de oxalato como hiperoxalurias, cirugía de derivación ileal, intoxicación por etilenglicol, anestesia con metoxiflurano o ingesta de altas dosis de ácido ascórbico. Aparece nefrolitiasis y nefrocalcinosis. Para su tratamiento se puede utilizar piridoxina (convierte el glicolato en glicina, en lugar de oxalato).",
    "Nefritis por radiación: es dependiente de dosis y afecta a los expuestos a más de 2.300 rad. Provoca una importante vasoconstricción que da lugar a isquemia renal. Es muy frecuente la HTA grave o maligna. Produce hialinosis glomerular, fibrosis intersticial y hialinización de la capa media de las arteriolas.",
  ],
  dosing:
    "El ajuste de dosis en la insuficiencia renal es imprescindible para evitar la toxicidad de fármacos con eliminación renal y procurar su adecuada eficacia. En la insuficiencia renal se puede realizar de dos maneras:",
  antimicrobials: [
    "Antibióticos: no requieren ajuste de dosis azitromicina, clindamicina, linezolid, doxiciclina, moxifloxacino, cloranfenicol.",
    "Antifúngicos: no precisan ajuste de dosis caspofungina, itraconazol y voriconazol (los dos últimos sólo por vía oral, ya que por vía intravenosa están contraindicados con aclaramiento de creatinina < 50 mL/min, por acúmulo del vehículo ciclohexidina).",
    "Antivirales: prácticamente todos precisan disminución de dosis pues presentan alto riesgo de neurotoxicidad, con cuadros confusionales, alucinaciones visuales, etc., sobre todo el aciclovir.",
    "Antituberculostáticos: no precisan ajuste de dosis pirimetamina, isoniazida, rifampicina, rifabutina.",
  ],
  nsaids:
    "Se debe evitar el uso de AINE en la insuficiencia renal. En el supuesto de que sean estrictamente necesarios es preferible utilizar AINE de vida media corta y durante pocos días. Se evitarán en pacientes con insuficiencia cardíaca, diabetes e hipertensión concomitantes. Se debe procurar que el paciente tenga una correcta hidratación.",
  interactions:
    "También hay que evitar su uso junto a inhibidores de la enzima convertidora de angiotensina (IECA), antagonistas de los receptores de angiotensina (ARA-II) y diuréticos. En pacientes con ERC grave (aclaramiento de creatinina < 30 mL/min) siempre están contraindicados.",
} as const;
