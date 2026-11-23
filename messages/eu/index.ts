/**
 * Textos en euskera (eu-ES). Tienen que tener exactamente las claves del
 * castellano: `satisfies Messages` lo comprueba al compilar y
 * `src/lib/__tests__/i18n-messages.test.ts` comprueba además los argumentos de
 * cada mensaje y que nada se haya quedado sin traducir.
 */
import type { Messages } from "../es";
import blog from "./blog.json";
import clinical from "./clinical.json";
import common from "./common.json";
import contact from "./contact.json";
import features from "./features.json";
import home from "./home.json";
import layout from "./layout.json";
import legal from "./legal.json";
import platform from "./platform.json";
import consultation from "./scenes/consultation.json";
import evidence from "./scenes/evidence.json";
import formats from "./scenes/formats.json";
import governance from "./scenes/governance.json";
import ui from "./scenes/ui.json";
import workspace from "./scenes/workspace.json";
import strata from "./strata.json";
import successCases from "./successCases.json";
import team from "./team.json";

const messages = {
  common,
  layout,
  home,
  successCases,
  strata,
  clinical,
  platform,
  features,
  scenes: { ui, consultation, evidence, formats, governance, workspace },
  team,
  contact,
  blog,
  legal,
} satisfies Messages;

export default messages;
