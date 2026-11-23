/**
 * Textos en castellano, el idioma fuente.
 *
 * Un fichero por zona de la web. Su forma es el tipo `Messages`: el resto de
 * idiomas tiene que cumplirlo con `satisfies Messages`, así que una clave que
 * falte en otro idioma rompe el build en lugar de verse en producción.
 */
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
};

export type Messages = typeof messages;

export default messages;
