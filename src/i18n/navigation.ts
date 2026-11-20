/**
 * Navegación que conoce el idioma: `Link`, `redirect`, `usePathname` y
 * `useRouter` añaden o quitan el prefijo y traducen la ruta. `usePathname`
 * devuelve la ruta interna, sin prefijo, que es la que hay que comparar para
 * marcar el enlace activo.
 */
import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
