import { describe, expect, it } from "vitest";
import { CHAT_NAVIGATION_RAIL_WIDTH } from "./chat-navigation-sizing";
import {
  WORKSPACE_PANEL_WIDTH_MIN,
  clampWorkspacePanelPreference,
  resizeThreePanelWorkspace,
  threePanelSideMaximumWidth,
  threePanelWorkspaceBalance,
  workspacePanelLayout,
  workspaceRailPanelMaximumWidth,
} from "./chat-workspace-sizing";

const navigationRailWidth = CHAT_NAVIGATION_RAIL_WIDTH;

function layout(
  viewportWidth: number,
  preferredPanelWidth: number | null = null,
  navigationWidth = navigationRailWidth,
) {
  return workspacePanelLayout({
    viewportWidth,
    navigationWidth,
    navigationExpanded: navigationWidth !== navigationRailWidth,
    preferredPanelWidth,
  });
}

describe("chat workspace sizing", () => {
  it("muestra el panel de trabajo a pantalla completa por debajo de 900 px", () => {
    expect(layout(899)).toMatchObject({ mode: "fullscreen", panelWidth: 899 });
  });

  it("reparte por igual el espacio posterior al rail en tablets", () => {
    expect(layout(900)).toMatchObject({ mode: "split-fixed", panelWidth: 426 });
    expect(layout(1023)).toMatchObject({
      mode: "split-fixed",
      panelWidth: 487.5,
    });
  });

  it("parte de un reparto 50/50 mientras la navegación permanece en rail", () => {
    expect(layout(1024)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 488,
    });
    expect(layout(1280)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 616,
    });
  });

  it("cambia exactamente en 1281 px de dos paneles a tres paneles", () => {
    expect(layout(1280, null, 360)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 440,
    });
    expect(layout(1281, null, 360)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 384.3,
    });
  });

  it("reserva un 40% para el chat y limita cada lateral al 30% o 640 px", () => {
    expect(threePanelSideMaximumWidth(1281)).toBeCloseTo(384.3);
    expect(threePanelSideMaximumWidth(1440)).toBe(432);
    expect(threePanelSideMaximumWidth(1512)).toBeCloseTo(453.6);
    expect(threePanelSideMaximumWidth(1920)).toBe(576);
    expect(threePanelSideMaximumWidth(2304)).toBe(640);
    expect(threePanelSideMaximumWidth(2560)).toBe(640);
  });

  it("mantiene el ancho inicial y expone el presupuesto lateral no utilizado", () => {
    expect(layout(1512, null, 420)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 453.59999999999997,
      panelMaximumWidth: 487.19999999999993,
    });
    expect(layout(1680, null, 420)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 504,
    });
    const result = layout(1920, null, 420);
    expect(result).toMatchObject({ mode: "split-resizable", panelWidth: 576 });
    expect(1920 - 420 - result.panelWidth).toBe(924);
    expect(1920 - 576 - layout(1920, null, 576).panelWidth).toBe(768);
    expect(layout(2560, null, 640)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 640,
      panelMaximumWidth: 640,
    });
  });

  it("permite acercar el lateral derecho al 50% cuando la navegación está en rail", () => {
    expect(layout(1512)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 732,
    });
    expect(layout(1680)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 816,
    });
    expect(layout(2048)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 1000,
    });
    expect(layout(2048, 1200).panelWidth).toBe(1000);
  });

  it("respeta la preferencia sin reducir el chat por debajo de su mínimo", () => {
    expect(layout(1024, 860)).toMatchObject({
      mode: "split-resizable",
      panelWidth: 488,
    });
    expect(1024 - navigationRailWidth - layout(1024, 860).panelWidth).toBe(488);
    expect(layout(1512, 360, 420).panelWidth).toBe(WORKSPACE_PANEL_WIDTH_MIN);
    expect(layout(1512, 860, 420).panelWidth).toBeCloseTo(487.2);
  });

  it("consume primero la capacidad lateral que la navegación no utiliza", () => {
    const result = resizeThreePanelWorkspace({
      viewportWidth: 1600,
      startPanelWidth: 480,
      startNavigationWidth: 240,
      delta: 240,
    });

    expect(result).toEqual({
      collapseNavigation: false,
      navigationWidth: 240,
      panelWidth: 720,
      phase: "free",
    });
    expect(1600 - result.navigationWidth - result.panelWidth).toBe(640);
  });

  it("mantiene el ancho preferido del workspace al reducir solo la navegación", () => {
    const initial = layout(1512, null, 453.6);
    const resizedNavigation = layout(1512, initial.panelWidth, 300);

    expect(initial.panelWidth).toBeCloseTo(453.6);
    expect(resizedNavigation.panelWidth).toBeCloseTo(initial.panelWidth);
    expect(resizedNavigation.panelMaximumWidth).toBeCloseTo(607.2);
  });

  it("reduce la navegación al superar el presupuesto lateral y conserva el chat", () => {
    const result = resizeThreePanelWorkspace({
      viewportWidth: 1512,
      startPanelWidth: 453.6,
      startNavigationWidth: 420,
      delta: 133.6,
    });

    expect(result.phase).toBe("balanced");
    expect(result.panelWidth).toBeCloseTo(587.2);
    expect(result.navigationWidth).toBeCloseTo(320);
    expect(1512 - result.navigationWidth - result.panelWidth).toBeCloseTo(
      604.8,
    );
  });

  it("mantiene la resistencia magnética antes de contraer la navegación", () => {
    const resistance = resizeThreePanelWorkspace({
      viewportWidth: 1512,
      startPanelWidth: 453.6,
      startNavigationWidth: 453.6,
      delta: 250,
    });
    const collapsed = resizeThreePanelWorkspace({
      viewportWidth: 1512,
      startPanelWidth: 453.6,
      startNavigationWidth: 453.6,
      delta: 277.6,
    });

    expect(resistance).toMatchObject({
      collapseNavigation: false,
      navigationWidth: 224,
      phase: "resistance",
    });
    expect(resistance.panelWidth).toBeCloseTo(683.2);
    expect(collapsed).toMatchObject({
      collapseNavigation: true,
      navigationWidth: 224,
      phase: "rail",
    });
    expect(collapsed.panelWidth).toBeCloseTo(683.2);
  });

  it("continúa el crecimiento tras el rail sin superar el reparto 50/50", () => {
    const maximum = workspaceRailPanelMaximumWidth(1512);
    const result = resizeThreePanelWorkspace({
      viewportWidth: 1512,
      startPanelWidth: 453.6,
      startNavigationWidth: 453.6,
      delta: 400,
    });

    expect(maximum).toBe(732);
    expect(result).toMatchObject({
      collapseNavigation: true,
      panelWidth: maximum,
      phase: "rail",
    });
  });

  it("adelanta el suelo de resistencia cuando lo exige el 50/50 estricto", () => {
    const balance = threePanelWorkspaceBalance(2048, 614.4);

    expect(balance.railPanelMaximumWidth).toBe(1000);
    expect(balance.navigationResistanceWidth).toBeCloseTo(228.8);
    expect(
      balance.sideWidthBudget - balance.navigationResistanceWidth,
    ).toBeCloseTo(1000);
  });

  it("ignora temporalmente la preferencia manual en tablets", () => {
    expect(layout(900, 860)).toMatchObject({
      mode: "split-fixed",
      panelWidth: 426,
    });
  });

  it("normaliza el mínimo del valor persistido sin imponer un máximo fijo", () => {
    expect(clampWorkspacePanelPreference(200)).toBe(WORKSPACE_PANEL_WIDTH_MIN);
    expect(clampWorkspacePanelPreference(608)).toBe(608);
    expect(clampWorkspacePanelPreference(1200)).toBe(1200);
  });
});
