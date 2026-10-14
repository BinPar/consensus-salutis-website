// Ported from consensus-salutis/apps/chat/src/components/chat-navigation-sizing.ts; keep sizing rules aligned with the product.
export const CHAT_NAVIGATION_WIDTH_KEY = "consensus-chat-navigation-w";
export const CHAT_NAVIGATION_WIDTH_DEFAULT = 260;
export const CHAT_NAVIGATION_WIDTH_MIN = 224;
export const CHAT_NAVIGATION_WIDTH_MAX = 420;
export const CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE = 48;
export const CHAT_NAVIGATION_COLLAPSE_THRESHOLD =
  CHAT_NAVIGATION_WIDTH_MIN - CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE;
export const CHAT_NAVIGATION_RAIL_WIDTH = 48;
export const CHAT_NAVIGATION_POINTER_SLOP = 4;
export const CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD =
  CHAT_NAVIGATION_POINTER_SLOP;

export function clampChatNavigationWidth(
  width: number,
  maximumWidth = CHAT_NAVIGATION_WIDTH_MAX,
) {
  return Math.min(
    Math.max(CHAT_NAVIGATION_WIDTH_MIN, maximumWidth),
    Math.max(CHAT_NAVIGATION_WIDTH_MIN, width),
  );
}

export function resizeChatNavigation({
  startWidth,
  startX,
  currentX,
  maximumWidth = CHAT_NAVIGATION_WIDTH_MAX,
}: {
  startWidth: number;
  startX: number;
  currentX: number;
  maximumWidth?: number;
}) {
  const rawWidth = startWidth + currentX - startX;
  return {
    collapse: rawWidth <= CHAT_NAVIGATION_COLLAPSE_THRESHOLD,
    width: clampChatNavigationWidth(rawWidth, maximumWidth),
  };
}

export function resizeChatNavigationFromRail({
  startX,
  currentX,
}: {
  startX: number;
  currentX: number;
}) {
  return {
    expand: currentX - startX >= CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD,
    width: CHAT_NAVIGATION_WIDTH_MIN,
  };
}
