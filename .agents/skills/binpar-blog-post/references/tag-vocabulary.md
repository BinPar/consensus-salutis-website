# Vocabulario de tags

Los tags son **libres** por decisión de producto: el schema solo pide que haya
al menos uno. La contrapartida es la deriva —«Evaluación» y «Evaluaciones»
conviviendo como dos tags— y esta lista es la mitigación blanda. Preferir un
tag existente vale más que acuñar el perfecto.

## Cómo funcionan

Cada tag se guarda **dos veces**: normalizado, que es la clave de la ruta
`/blog/tag/<tag>`, y tal como lo escribiste, que es lo que se pinta.

```
"Gobierno del conocimiento"  →  /blog/tag/gobierno-del-conocimiento
"Evaluación"                 →  /blog/tag/evaluacion
"IA" · "ia" · "I.A."         →  /blog/tag/ia   (los tres colapsan)
```

La normalización quita acentos, baja a minúsculas y une con guiones. Lo que
colapsa, colapsa solo; lo que no —sinónimos de verdad— es lo que hay que
vigilar aquí.

## Reglas

- **2–4 tags.** Uno solo desperdicia el índice; seis no clasifican nada.
- **Escríbelos como los quieres ver**: mayúscula inicial y acentos. La etiqueta
  visible sale literal del frontmatter.
- **Singular**, salvo que el plural sea el término («Preguntas de control»).
- **Reutiliza antes de acuñar.** Mira qué tags existen ya:

  ```bash
  grep -h '^tags:' src/content/blog/*.mdx | sort | uniq -c
  ```

- Un tag nuevo se justifica si va a tener **más de un post**. Si no, es una
  frase del cuerpo disfrazada de taxonomía.
- No metas el nombre de la marca como tag: todo el blog es de la marca.

## Vocabulario sugerido

Los seis primeros son léxico acuñado de la voz de marca: usarlos como tag
refuerza el término en vez de diluirlo.

| Tag | Cuándo |
|---|---|
| `Consenso verificable` | La promesa bandera: una conclusión rastreable hasta su fuente |
| `Evidencia visible` | La cita y su recorrido hasta el documento |
| `Gobierno del conocimiento` | Quién decide qué entra en el corpus y con qué versión |
| `Preguntas de control` | Baterías que fijan que el comportamiento no se degrada |
| `Corpus vivo` | Documentación que cambia, y el versionado que exige |
| `Umbral de revisión` | Cuándo una respuesta pide ojo humano |
| `Trazabilidad` | La garantía transversal; el tag más frecuente del blog |
| `Evaluación` | Cómo se mide una respuesta y qué falla al medirla |
| `Seguridad del paciente` | Riesgo clínico, modos de fallo, límites declarados |
| `Guías clínicas` | Protocolos, consensos, documentos normativos |
| `Regulación` | AI Act, protección de datos, marco sanitario (**sin** afirmar conformidad) |
| `Adopción institucional` | Compra pública, comités, despliegue por servicio |
| `Interoperabilidad` | Integración con los sistemas del centro |
| `Formación clínica` | Uso docente y de residentes |

## Vetados

Los del léxico vetado de la voz —`copiloto`, `asistente virtual`, `agente`,
`cerebro clínico`— y los de la frontera de divulgación: nada de `Convex`,
`RAG`, `embeddings`, `LLM`, nombres de proveedor o de modelo. El tag es texto
público como cualquier otro, y además es una URL indexada.

## El aviso de tags parecidos

`pnpm test` compara los tags por distancia de edición y **avisa sin romper**:

```
[blog] tags sospechosamente parecidos: «evaluacion» ≈ «evaluaciones»
```

Es un aviso a propósito: romper el build por una sospecha bloquearía a quien
escribe. Si aparece con un tag tuyo, o lo unificas o lo justificas en el PR.
No lo ignores en silencio.
