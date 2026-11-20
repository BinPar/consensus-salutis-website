import type { Messages } from "../../messages/es";
import type { Locale } from "./routing";

/* Claves tipadas: una clave que no existe en castellano no compila. */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
