import { FlatCompat } from "@eslint/eslintrc";
import i18next from "eslint-plugin-i18next";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next", "generated", "next-env.d.ts", "node_modules"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    /*
      Con `src/app/[locale]/page.tsx`, la regla toma cualquier enlace de un
      segmento (`/contacto`) por una página de `[locale]`. El laboratorio usa
      `<a>` a propósito y no navega dentro del sitio.
    */
    files: ["src/app/casos-lab/**"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: ["src/app/casos-lab/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/navigation",
              importNames: ["usePathname"],
              message:
                "Usa `usePathname` de `~/i18n/navigation`: el de Next incluye el prefijo del idioma y en el servidor no coincide con el navegador.",
            },
          ],
          patterns: [
            {
              group: ["**/casos-lab", "**/casos-lab/**"],
              message:
                "La web no puede importar código del laboratorio. La dependencia solo puede ir del laboratorio hacia componentes compartidos.",
            },
          ],
        },
      ],
    },
  },
  {
    /*
      Ningún texto visible escrito en el código de la web pública: tiene que
      salir de `messages/<idioma>/` para que exista en todos los idiomas. Se
      comprueban el texto de JSX y los atributos que se leen o se oyen. Quedan
      fuera el laboratorio, los tests y lo que solo existe en castellano (el
      evaluador, el informe y el espacio de cliente, con sus componentes).
    */
    files: ["src/app/**/*.tsx"],
    ignores: [
      "src/app/casos-lab/**",
      "src/app/(castellano)/**",
      "src/app/_components/interview/**",
      "src/app/_components/informe/**",
      "src/app/_components/espacio/**",
      "src/app/_components/eligibility-form.tsx",
      "src/app/_components/mail-generator/**",
      "**/__tests__/**",
    ],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          /*
            Lo que no se traduce: cifras y símbolos (con espacios), siglas, la
            marca y los correos. Son los valores por defecto de la regla más la
            marca y los correos.
          */
          words: {
            exclude: [
              "[\\s0-9!-/:-@[-`{-~·×→…−]+",
              "[A-Z_-]+",
              "BinPar",
              "[\\w.+-]+@binpar\\.com",
            ],
          },
          "jsx-attributes": {
            include: ["^aria-label$", "^alt$", "^title$", "^placeholder$"],
          },
          message:
            "Texto visible escrito en el código: llévalo a `messages/es/` y usa `t()`.",
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
);
