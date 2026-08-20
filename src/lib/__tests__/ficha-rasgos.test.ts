/**
 * Los cinco rasgos, las tres cifras y el avance de bloques.
 *
 * ## Por qué cinco casos por rasgo y no treinta y dos
 *
 * Un rasgo de cuatro fragmentos opcionales tiene treinta y dos combinaciones y
 * ninguna prueba nada que no pruebe el **prefijo creciente más un hueco
 * intermedio**: si «pivote» sale bien, «pivote + 1» sale bien y «pivote + 3 sin
 * el 2» sale bien, la composición es correcta por construcción. Lo que sí hay que
 * probar de todas es la regla 1 —sin pivote, no hay rasgo— porque es la que hace
 * que el panel crezca en vez de esperar vacío.
 */

import { describe, expect, it } from "vitest";

import {
  avanceDeBloques,
  cifras,
  contarDudas,
  fraseTurnos,
  rasgoDe,
  rasgos,
} from "~/lib/ficha-rasgos";
import {
  EMPTY_FICHA,
  type Ficha,
  type FichaCell,
  type FichaValue,
} from "~/lib/ficha";

/** Una celda del agente con confianza media, que es el caso normal. */
function cell(valor: FichaValue): FichaCell {
  return { valor, confianza: "media", origen: "agente" };
}

/** Una ficha con los campos que se le pasen: `{"perfil.pais": "España"}`. */
function ficha(campos: Record<string, FichaValue | FichaCell>): Ficha {
  const out: Ficha = {
    perfil: {},
    corpus: {},
    uso: {},
    datos: {},
    operativa: {},
  };

  for (const [path, valor] of Object.entries(campos)) {
    const [block, field] = path.split(".") as [keyof Ficha, string];
    const esCelda =
      typeof valor === "object" &&
      !Array.isArray(valor) &&
      "confianza" in valor;
    out[block][field] = esCelda ? valor : cell(valor);
  }

  return out;
}

function texto(f: Ficha, block: Parameters<typeof rasgoDe>[1]): string | null {
  return rasgoDe(f, block)?.text ?? null;
}

describe("sin su pivote, un bloque no se pinta", () => {
  it("una ficha vacía no da ningún rasgo", () => {
    expect(rasgos(EMPTY_FICHA)).toEqual([]);
  });

  it("un bloque con datos pero sin pivote sigue sin rasgo", () => {
    // Cinco de los siete campos de perfil, y ninguno es `familia`.
    const f = ficha({
      "perfil.pais": "España",
      "perfil.centros": 3,
      "perfil.profesionales": 600,
      "perfil.ambitoPublico": true,
      "perfil.comunidad": "Madrid",
    });

    expect(texto(f, "perfil")).toBeNull();
    expect(rasgos(f)).toEqual([]);
  });

  it("cada bloque tiene exactamente un pivote, y es el que lo enciende", () => {
    const pivotes = {
      perfil: { "perfil.familia": "hospital" },
      corpus: { "corpus.corpusPropio": true },
      uso: { "uso.usoPrincipal": "consulta clínica" },
      datos: { "datos.phiPrevisto": "no" },
      operativa: { "operativa.sponsorEjecutivo": true },
    } as const;

    for (const [block, campos] of Object.entries(pivotes)) {
      const rasgo = rasgoDe(ficha(campos), block as keyof typeof pivotes);
      expect(rasgo, block).not.toBeNull();
      expect(rasgo!.text.length, block).toBeGreaterThan(3);
    }
  });
});

describe("perfil degrada por prefijos", () => {
  it("solo el pivote", () => {
    expect(texto(ficha({ "perfil.familia": "hospital" }), "perfil")).toBe(
      "Hospital",
    );
  });

  it("pivote y titularidad", () => {
    expect(
      texto(
        ficha({ "perfil.familia": "hospital", "perfil.ambitoPublico": true }),
        "perfil",
      ),
    ).toBe("Hospital público");
  });

  it("los tres, que es el rasgo completo", () => {
    expect(
      texto(
        ficha({
          "perfil.familia": "hospital",
          "perfil.ambitoPublico": true,
          "perfil.comunidad": "Madrid",
        }),
        "perfil",
      ),
    ).toBe("Hospital público en Madrid");
  });

  it("con un hueco intermedio no queda ni una coma suelta ni un « en » vacío", () => {
    expect(
      texto(
        ficha({ "perfil.familia": "hospital", "perfil.comunidad": "Madrid" }),
        "perfil",
      ),
    ).toBe("Hospital en Madrid");
  });

  it("la titularidad privada se dice, no se calla", () => {
    expect(
      texto(
        ficha({ "perfil.familia": "clínica", "perfil.ambitoPublico": false }),
        "perfil",
      ),
    ).toBe("Clínica privada");
  });

  /*
    El tipo de institución lo escribe el modelo y no hay lista cerrada, así que el
    adjetivo tiene que concordar con lo que llegue. «Hospital pública» es el fallo
    que un cliente lee como «esto lo ha escrito una máquina».
  */
  it("la titularidad concuerda con el género del tipo de institución", () => {
    const casos: Array<[string, string]> = [
      ["hospital", "Hospital público"],
      ["centro de salud", "Centro de salud público"],
      ["clínica", "Clínica pública"],
      ["fundación", "Fundación pública"],
      ["sociedad científica", "Sociedad científica pública"],
      ["mutua", "Mutua pública"],
      ["instituto", "Instituto público"],
    ];

    for (const [familia, esperado] of casos) {
      expect(
        texto(
          ficha({ "perfil.familia": familia, "perfil.ambitoPublico": true }),
          "perfil",
        ),
        familia,
      ).toBe(esperado);
    }
  });
});

describe("corpus degrada por prefijos", () => {
  it("solo el pivote, en sus dos ramas", () => {
    expect(texto(ficha({ "corpus.corpusPropio": true }), "corpus")).toBe(
      "Documentación propia",
    );
    expect(texto(ficha({ "corpus.corpusPropio": false }), "corpus")).toBe(
      "Sin documentación propia",
    );
  });

  it("pivote y formato", () => {
    expect(
      texto(
        ficha({ "corpus.corpusPropio": true, "corpus.formato": "PDF" }),
        "corpus",
      ),
    ).toBe("Documentación propia en PDF");
  });

  it("pivote, formato y vigencia", () => {
    expect(
      texto(
        ficha({
          "corpus.corpusPropio": true,
          "corpus.formato": "PDF",
          "corpus.vigencia": "revisión anual",
        }),
        "corpus",
      ),
    ).toBe("Documentación propia en PDF, revisión anual");
  });

  it("con el formato ausente, el rasgo salta al siguiente fragmento", () => {
    expect(
      texto(
        ficha({
          "corpus.corpusPropio": true,
          "corpus.vigencia": "revisión anual",
        }),
        "corpus",
      ),
    ).toBe("Documentación propia, revisión anual");
  });

  /*
    El volumen es la primera de las tres cifras y se ve en grande justo encima del
    rasgo. Si además entrara aquí, la única línea del rasgo se gastaría repitiendo
    lo que el ojo acaba de leer.
  */
  it("el volumen no entra en el rasgo: ya está en las cifras", () => {
    const f = ficha({
      "corpus.corpusPropio": true,
      "corpus.volumenDocs": 1_200,
    });

    expect(texto(f, "corpus")).toBe("Documentación propia");
    expect(cifras(f)).toEqual([
      { path: "corpus.volumenDocs", valor: "1.200", etiqueta: "documentos" },
    ]);
  });
});

describe("uso y operativa degradan por prefijos", () => {
  it("uso enumera los perfiles con «y»", () => {
    expect(
      texto(
        ficha({
          "uso.usoPrincipal": "consulta en el punto de atención",
          "uso.perfilesUsuarios": ["médicos", "enfermería"],
        }),
        "uso",
      ),
    ).toBe("Consulta en el punto de atención, médicos y enfermería");
  });

  it("uso sin perfiles se queda en el pivote", () => {
    expect(
      texto(ficha({ "uso.usoPrincipal": "consulta clínica" }), "uso"),
    ).toBe("Consulta clínica");
  });

  it("operativa añade la capacidad de TI tras un separador", () => {
    expect(
      texto(
        ficha({
          "operativa.sponsorEjecutivo": true,
          "operativa.capacidadTI": "equipo TI propio",
        }),
        "operativa",
      ),
    ).toBe("Patrocinio de dirección · equipo TI propio");
  });

  it("sin patrocinio se dice como negativo", () => {
    expect(
      texto(ficha({ "operativa.sponsorEjecutivo": false }), "operativa"),
    ).toBe("Sin patrocinio de dirección");
  });
});

describe("datos dice las garantías, incluidas las que faltan", () => {
  it("la ausencia de PHI es el hallazgo, y va sola si no hay más", () => {
    expect(texto(ficha({ "datos.phiPrevisto": "no" }), "datos")).toBe(
      "Sin datos de paciente",
    );
  });

  it("DPO y comité juntos se abrevian", () => {
    expect(
      texto(
        ficha({
          "datos.phiPrevisto": "no",
          "datos.dpo": true,
          "datos.comiteEtica": true,
        }),
        "datos",
      ),
    ).toBe("Sin datos de paciente · DPO y comité");
  });

  it("solo uno de los dos no arrastra al otro", () => {
    expect(
      texto(ficha({ "datos.phiPrevisto": "no", "datos.dpo": true }), "datos"),
    ).toBe("Sin datos de paciente · DPO");
  });

  /*
    Un DPO que no está es un dato, no un hueco. Callarlo lo convertiría en «no lo
    hemos preguntado», que es exactamente lo que la ficha no debe insinuar.
  */
  it("un negativo se escribe como negativo", () => {
    expect(
      texto(
        ficha({
          "datos.phiPrevisto": "no",
          "datos.dpo": false,
          "datos.comiteEtica": false,
        }),
        "datos",
      ),
    ).toBe("Sin datos de paciente · sin DPO y comité");
  });

  it("mezclados, se dicen los dos lados", () => {
    expect(
      texto(
        ficha({
          "datos.phiPrevisto": "no",
          "datos.dpo": true,
          "datos.comiteEtica": false,
        }),
        "datos",
      ),
    ).toBe("Sin datos de paciente · DPO, sin comité");
  });

  it("con PHI previsto, el pivote lo dice en vez de omitirlo", () => {
    expect(texto(ficha({ "datos.phiPrevisto": "sí" }), "datos")).toBe(
      "Datos de paciente: sí",
    );
  });
});

describe("los fragmentos llevan de dónde salen, para poder marcarse", () => {
  it("el fragmento decisivo va señalado y el texto de unión no", () => {
    const rasgo = rasgoDe(
      ficha({
        "perfil.familia": "hospital",
        "perfil.ambitoPublico": true,
        "perfil.comunidad": "Madrid",
      }),
      "perfil",
    )!;

    const conPath = rasgo.fragments.filter((f) => f.path !== undefined);
    expect(conPath.map((f) => f.path)).toEqual([
      "perfil.familia",
      "perfil.ambitoPublico",
      "perfil.comunidad",
    ]);

    // La titularidad y la comunidad son los dos decisivos de perfil.
    expect(
      rasgo.fragments.filter((f) => f.decisive === true).map((f) => f.text),
    ).toEqual(["público", "Madrid"]);

    // El « en » es unión: no puede llevar marca de nada.
    const union = rasgo.fragments.filter((f) => f.path === undefined);
    expect(union.map((f) => f.text)).toEqual([" ", " en "]);
    expect(union.every((f) => f.decisive === undefined)).toBe(true);
  });

  it("un fragmento que habla de dos campos no se atribuye a ninguno", () => {
    const rasgo = rasgoDe(
      ficha({
        "datos.phiPrevisto": "no",
        "datos.dpo": true,
        "datos.comiteEtica": true,
      }),
      "datos",
    )!;

    const garantias = rasgo.fragments.at(-1)!;
    expect(garantias.text).toBe("DPO y comité");
    expect(garantias.path).toBeUndefined();
  });

  it("si habla de uno solo, sí lo lleva", () => {
    const rasgo = rasgoDe(
      ficha({ "datos.phiPrevisto": "no", "datos.comiteEtica": false }),
      "datos",
    )!;

    expect(rasgo.fragments.at(-1)).toEqual({
      text: "sin comité",
      path: "datos.comiteEtica",
    });
  });
});

describe("las tres cifras salen de la lista de prioridad", () => {
  const completa = {
    "corpus.volumenDocs": 1_200,
    "perfil.centros": 3,
    "perfil.profesionales": 600,
    "perfil.especialidades": ["a", "b", "c"],
    "corpus.volumenPaginas": 18_000,
  };

  it("se pintan las tres primeras que tengan valor", () => {
    expect(cifras(ficha(completa))).toEqual([
      { path: "corpus.volumenDocs", valor: "1.200", etiqueta: "documentos" },
      { path: "perfil.centros", valor: "3", etiqueta: "centros" },
      { path: "perfil.profesionales", valor: "600", etiqueta: "profesionales" },
    ]);
  });

  it("si solo hay una, se pinta una", () => {
    expect(
      cifras(ficha({ "perfil.centros": 3 })).map((c) => c.etiqueta),
    ).toEqual(["centros"]);
  });

  it("baja por la lista cuando las de arriba faltan", () => {
    expect(
      cifras(
        ficha({
          "perfil.especialidades": ["a", "b"],
          "corpus.volumenPaginas": 18_000,
        }),
      ).map((c) => c.etiqueta),
    ).toEqual(["especialidades", "páginas"]);
  });

  it("una lista da su longitud", () => {
    expect(
      cifras(ficha({ "perfil.especialidades": ["a", "b", "c"] }))[0]!.valor,
    ).toBe("3");
  });

  it("un cero cuenta como sin valor: no hay cifras en cero", () => {
    expect(
      cifras(ficha({ "corpus.volumenDocs": 0, "perfil.centros": 2 })),
    ).toEqual([{ path: "perfil.centros", valor: "2", etiqueta: "centros" }]);
  });

  it("nunca una cifra con decimales", () => {
    expect(cifras(ficha({ "perfil.centros": 2.5 }))).toEqual([]);
  });

  it("un campo de texto no da cifra aunque esté en la ficha", () => {
    expect(cifras(ficha({ "corpus.formato": "PDF" }))).toEqual([]);
  });
});

describe("el avance cuenta bloques de conversación, no campos", () => {
  it("una ficha vacía no ha cerrado nada y no tiene bloque en curso", () => {
    expect(avanceDeBloques(EMPTY_FICHA)).toEqual({ cerrados: 0, actual: null });
  });

  it("con datos solo del primer bloque, cero cerrados y perfil en curso", () => {
    expect(avanceDeBloques(ficha({ "perfil.familia": "hospital" }))).toEqual({
      cerrados: 0,
      actual: "perfil",
    });
  });

  /*
    Lo que hace que el indicador describa la charla y no el relleno: perfil pasa a
    cerrado por el hecho de que la conversación ya está en corpus, aunque a perfil
    le falten cinco campos.
  */
  it("un bloque se cierra porque la conversación pasó al siguiente", () => {
    expect(
      avanceDeBloques(
        ficha({ "perfil.familia": "hospital", "corpus.corpusPropio": true }),
      ),
    ).toEqual({ cerrados: 1, actual: "corpus" });
  });

  /*
    El prompt dice explícitamente que el agente NO recorre los bloques en orden
    fijo: una inferencia temprana en operativa no puede poner el arco casi al
    final (era el comportamiento antiguo, que además retrocedía al volver la
    conversación a un bloque anterior).
  */
  it("un salto adelante NO cierra lo no visitado", () => {
    expect(
      avanceDeBloques(ficha({ "operativa.sponsorEjecutivo": true })),
    ).toEqual({
      cerrados: 0,
      actual: "operativa",
    });
  });

  it("cuenta bloques visitados aunque no sean contiguos", () => {
    expect(
      avanceDeBloques(
        ficha({
          "perfil.familia": "hospital",
          "operativa.sponsorEjecutivo": true,
        }),
      ),
    ).toEqual({ cerrados: 1, actual: "operativa" });
  });
});

describe("las dudas se cuentan sobre los 28 campos", () => {
  it("sin confianza baja no hay dudas", () => {
    expect(contarDudas(ficha({ "perfil.familia": "hospital" }))).toBe(0);
  });

  it("cuenta también un campo que no sale en ningún rasgo", () => {
    // `idpCorporativo` no aparece en el rasgo de operativa: es dato de informe.
    // Justo por eso la línea de incertidumbre es de nivel de panel.
    const f = ficha({
      "perfil.comunidad": {
        valor: "Madrid",
        confianza: "baja",
        origen: "agente",
      },
      "operativa.idpCorporativo": {
        valor: "Azure AD",
        confianza: "baja",
        origen: "agente",
      },
    });

    expect(contarDudas(f)).toBe(2);
  });
});

/**
 * La frase suave del avance.
 *
 * Lo que se prueba es lo que se rompió en producción: con el presupuesto de
 * treinta turnos que reparte el servidor, los umbrales absolutos de la primera
 * versión —9 / 5 / 2 restantes— dejaban «Acabamos de empezar» clavado durante dos
 * tercios de la entrevista, con el arco ya en «4 de 5» justo al lado.
 */
describe("la frase del avance", () => {
  /** Los valores reales del servidor: `turno + turnosRestantes = 30`. */
  const restantesDe = (turno: number) => 30 - turno;

  it("avanza con el presupuesto de treinta turnos del servidor", () => {
    expect(fraseTurnos(1, restantesDe(1))).toBe("Acabamos de empezar");
    expect(fraseTurnos(12, restantesDe(12))).toBe("Vamos por la mitad");
    expect(fraseTurnos(24, restantesDe(24))).toBe("Recta final");
  });

  /*
    El caso reportado: el arco decía «Corpus, 2 de 5» y la frase seguía diciendo
    «Acabamos de empezar» porque quedaban veintiséis turnos de treinta.
  */
  it("no contradice al arco: los bloques visitados son el suelo", () => {
    expect(fraseTurnos(4, restantesDe(4))).toBe("Acabamos de empezar");
    expect(fraseTurnos(4, restantesDe(4), 2)).toBe("Vamos por la mitad");
    expect(fraseTurnos(4, restantesDe(4), 4)).toBe("Recta final");
  });

  it("dice «última» solo cuando queda una y hay turnos de los que fiarse", () => {
    expect(fraseTurnos(29, 1)).toBe("Última pregunta");
    expect(fraseTurnos(29, 2)).toBe("Recta final");
    // Un servidor que no manda los turnos no puede anunciar el final.
    expect(fraseTurnos(0, 0)).toBe("Acabamos de empezar");
    expect(fraseTurnos(0, 0, 4)).toBe("Recta final");
  });

  /* Un presupuesto absurdo —estado a medio cargar— no adelanta el final. */
  it("aguanta un turno sin restantes creíbles", () => {
    expect(fraseTurnos(1, 0)).toBe("Acabamos de empezar");
  });

  it("nunca retrocede a lo largo de una entrevista", () => {
    const ORDEN = [
      "Acabamos de empezar",
      "Vamos por la mitad",
      "Recta final",
      "Última pregunta",
    ];

    let anterior = 0;
    for (let turno = 1; turno <= 29; turno += 1) {
      const bloques = Math.min(Math.ceil(turno / 6), 5);
      const indice = ORDEN.indexOf(
        fraseTurnos(turno, restantesDe(turno), bloques),
      );
      expect(indice).toBeGreaterThanOrEqual(anterior);
      anterior = indice;
    }
  });
});
