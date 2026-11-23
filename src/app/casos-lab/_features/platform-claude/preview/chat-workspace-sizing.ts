// Ported from consensus-salutis/apps/chat/src/components/chat-workspace-sizing.ts; keep sizing rules aligned with the product.
import {
  CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE,
  CHAT_NAVIGATION_RAIL_WIDTH,
  CHAT_NAVIGATION_WIDTH_MIN,
} from "./chat-navigation-sizing";

export const WORKSPACE_PANEL_FULLSCREEN_MAX_WIDTH = 899;
export const WORKSPACE_PANEL_RESIZE_MIN_WIDTH = 1024;
export const THREE_PANEL_MIN_WIDTH = 1281;
export const WORKSPACE_PANEL_WIDTH_MIN = 360;
export const CHAT_WITH_WORKSPACE_PANEL_WIDTH_MIN = 480;
export const THREE_PANEL_SIDE_WIDTH_MAX = 640;
export const THREE_PANEL_SIDE_WIDTH_RATIO = 0.3;

export type WorkspacePanelLayout = {
  mode: "fullscreen" | "split-fixed" | "split-resizable";
  panelWidth: number;
  panelMaximumWidth: number;
};

export type ThreePanelWorkspaceBalance = {
  sideMaximumWidth: number;
  sideWidthBudget: number;
  freePanelMaximumWidth: number;
  railPanelMaximumWidth: number;
  navigationResistanceWidth: number;
};

export type ThreePanelWorkspaceResize = {
  collapseNavigation: boolean;
  navigationWidth: number;
  panelWidth: number;
  phase: "free" | "balanced" | "resistance" | "rail";
};

export function clampWorkspacePanelPreference(width: number) {
  return Math.max(WORKSPACE_PANEL_WIDTH_MIN, width);
}

export function threePanelSideMaximumWidth(viewportWidth: number) {
  return Math.min(
    THREE_PANEL_SIDE_WIDTH_MAX,
    viewportWidth * THREE_PANEL_SIDE_WIDTH_RATIO,
    (viewportWidth - CHAT_WITH_WORKSPACE_PANEL_WIDTH_MIN) / 2,
  );
}

export function workspaceRailPanelMaximumWidth(viewportWidth: number) {
  return Math.max(
    WORKSPACE_PANEL_WIDTH_MIN,
    (viewportWidth - CHAT_NAVIGATION_RAIL_WIDTH) / 2,
  );
}

export function threePanelWorkspaceBalance(
  viewportWidth: number,
  navigationWidth: number,
): ThreePanelWorkspaceBalance {
  const sideMaximumWidth = threePanelSideMaximumWidth(viewportWidth);
  const sideWidthBudget = sideMaximumWidth * 2;
  const railPanelMaximumWidth = workspaceRailPanelMaximumWidth(viewportWidth);
  const navigationResistanceWidth = Math.max(
    CHAT_NAVIGATION_WIDTH_MIN,
    sideWidthBudget - railPanelMaximumWidth,
  );

  return {
    sideMaximumWidth,
    sideWidthBudget,
    freePanelMaximumWidth: Math.min(
      railPanelMaximumWidth,
      sideWidthBudget - navigationWidth,
    ),
    railPanelMaximumWidth,
    navigationResistanceWidth,
  };
}

export function resizeThreePanelWorkspace({
  viewportWidth,
  startPanelWidth,
  startNavigationWidth,
  delta,
}: {
  viewportWidth: number;
  startPanelWidth: number;
  startNavigationWidth: number;
  delta: number;
}): ThreePanelWorkspaceResize {
  const balance = threePanelWorkspaceBalance(
    viewportWidth,
    startNavigationWidth,
  );
  const requestedPanelWidth = Math.max(
    WORKSPACE_PANEL_WIDTH_MIN,
    startPanelWidth + delta,
  );

  if (requestedPanelWidth <= balance.freePanelMaximumWidth) {
    return {
      collapseNavigation: false,
      navigationWidth: startNavigationWidth,
      panelWidth: requestedPanelWidth,
      phase: "free",
    };
  }

  const requestedNavigationWidth =
    balance.sideWidthBudget - requestedPanelWidth;
  const resistanceThreshold =
    balance.navigationResistanceWidth - CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE;
  const resistancePanelWidth = Math.min(
    balance.railPanelMaximumWidth,
    balance.sideWidthBudget - balance.navigationResistanceWidth,
  );

  if (requestedNavigationWidth > balance.navigationResistanceWidth) {
    return {
      collapseNavigation: false,
      navigationWidth: requestedNavigationWidth,
      panelWidth: requestedPanelWidth,
      phase: "balanced",
    };
  }

  if (requestedNavigationWidth > resistanceThreshold) {
    return {
      collapseNavigation: false,
      navigationWidth: balance.navigationResistanceWidth,
      panelWidth: resistancePanelWidth,
      phase: "resistance",
    };
  }

  const resistanceOvershoot = resistanceThreshold - requestedNavigationWidth;
  return {
    collapseNavigation: true,
    navigationWidth: balance.navigationResistanceWidth,
    panelWidth: Math.min(
      balance.railPanelMaximumWidth,
      resistancePanelWidth + resistanceOvershoot,
    ),
    phase: "rail",
  };
}

export function workspacePanelLayout({
  viewportWidth,
  navigationWidth,
  navigationExpanded,
  preferredPanelWidth,
}: {
  viewportWidth: number;
  navigationWidth: number;
  navigationExpanded: boolean;
  preferredPanelWidth: number | null;
}): WorkspacePanelLayout {
  if (viewportWidth <= WORKSPACE_PANEL_FULLSCREEN_MAX_WIDTH) {
    return {
      mode: "fullscreen",
      panelWidth: viewportWidth,
      panelMaximumWidth: viewportWidth,
    };
  }

  const splitWidth = Math.max(0, viewportWidth - navigationWidth);
  const equalPanelWidth = splitWidth / 2;

  if (viewportWidth < WORKSPACE_PANEL_RESIZE_MIN_WIDTH) {
    return {
      mode: "split-fixed",
      panelWidth: equalPanelWidth,
      panelMaximumWidth: equalPanelWidth,
    };
  }

  const threePanelsVisible =
    viewportWidth >= THREE_PANEL_MIN_WIDTH && navigationExpanded;
  const threePanelSideMaximum = threePanelSideMaximumWidth(viewportWidth);
  const responsivePanelMaximum = threePanelsVisible
    ? threePanelWorkspaceBalance(viewportWidth, navigationWidth)
        .freePanelMaximumWidth
    : equalPanelWidth;
  const maximumPanelWidth = Math.max(
    WORKSPACE_PANEL_WIDTH_MIN,
    Math.min(
      responsivePanelMaximum,
      splitWidth - CHAT_WITH_WORKSPACE_PANEL_WIDTH_MIN,
    ),
  );
  const requestedPanelWidth =
    preferredPanelWidth ??
    (threePanelsVisible ? threePanelSideMaximum : equalPanelWidth);

  return {
    mode: "split-resizable",
    panelWidth: Math.min(
      maximumPanelWidth,
      Math.max(WORKSPACE_PANEL_WIDTH_MIN, requestedPanelWidth),
    ),
    panelMaximumWidth: maximumPanelWidth,
  };
}
