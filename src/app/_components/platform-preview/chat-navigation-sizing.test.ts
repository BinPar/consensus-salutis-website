import { describe, expect, it } from "vitest";
import {
  CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE,
  CHAT_NAVIGATION_COLLAPSE_THRESHOLD,
  CHAT_NAVIGATION_POINTER_SLOP,
  CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD,
  CHAT_NAVIGATION_RAIL_WIDTH,
  CHAT_NAVIGATION_WIDTH_DEFAULT,
  CHAT_NAVIGATION_WIDTH_MAX,
  CHAT_NAVIGATION_WIDTH_MIN,
  clampChatNavigationWidth,
  resizeChatNavigation,
  resizeChatNavigationFromRail,
} from "./chat-navigation-sizing";

describe("chat navigation sizing", () => {
  it("respeta los límites del panel expandido", () => {
    expect(clampChatNavigationWidth(120)).toBe(CHAT_NAVIGATION_WIDTH_MIN);
    expect(clampChatNavigationWidth(CHAT_NAVIGATION_WIDTH_DEFAULT)).toBe(
      CHAT_NAVIGATION_WIDTH_DEFAULT,
    );
    expect(clampChatNavigationWidth(900)).toBe(CHAT_NAVIGATION_WIDTH_MAX);
  });

  it("admite un máximo dinámico sin alterar el límite predeterminado", () => {
    expect(clampChatNavigationWidth(640, 453.6)).toBe(453.6);
    expect(clampChatNavigationWidth(700, 640)).toBe(640);
    expect(clampChatNavigationWidth(900)).toBe(CHAT_NAVIGATION_WIDTH_MAX);
  });

  it("ensancha hacia la derecha y reduce hacia la izquierda", () => {
    expect(
      resizeChatNavigation({ startWidth: 260, startX: 260, currentX: 340 }),
    ).toEqual({
      collapse: false,
      width: 340,
    });
    expect(
      resizeChatNavigation({ startWidth: 340, startX: 340, currentX: 260 }),
    ).toEqual({
      collapse: false,
      width: 260,
    });
  });

  it("aplica el máximo dinámico durante el arrastre", () => {
    expect(
      resizeChatNavigation({
        startWidth: 420,
        startX: 420,
        currentX: 620,
        maximumWidth: 453.6,
      }),
    ).toEqual({ collapse: false, width: 453.6 });
  });

  it("mantiene el mínimo visual hasta cruzar el umbral magnético", () => {
    const cursorAtVisualMinimum = 224;
    const cursorInsideResistanceZone =
      cursorAtVisualMinimum - CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE + 1;

    expect(
      resizeChatNavigation({
        startWidth: 260,
        startX: 260,
        currentX: cursorAtVisualMinimum,
      }),
    ).toEqual({ collapse: false, width: CHAT_NAVIGATION_WIDTH_MIN });
    expect(
      resizeChatNavigation({
        startWidth: 260,
        startX: 260,
        currentX: cursorInsideResistanceZone,
      }),
    ).toEqual({ collapse: false, width: CHAT_NAVIGATION_WIDTH_MIN });
    expect(
      resizeChatNavigation({
        startWidth: 260,
        startX: 260,
        currentX: CHAT_NAVIGATION_COLLAPSE_THRESHOLD,
      }),
    ).toEqual({ collapse: true, width: CHAT_NAVIGATION_WIDTH_MIN });
  });

  it("permite volver a cerrar dentro del arrastre iniciado en el rail", () => {
    const resizeStartX = 300;

    expect(
      resizeChatNavigation({
        startWidth: CHAT_NAVIGATION_WIDTH_MIN,
        startX: resizeStartX,
        currentX: resizeStartX,
      }),
    ).toEqual({ collapse: false, width: CHAT_NAVIGATION_WIDTH_MIN });
    expect(
      resizeChatNavigation({
        startWidth: CHAT_NAVIGATION_WIDTH_MIN,
        startX: resizeStartX,
        currentX: resizeStartX - CHAT_NAVIGATION_COLLAPSE_DRAG_DISTANCE,
      }),
    ).toEqual({ collapse: true, width: CHAT_NAVIGATION_WIDTH_MIN });
  });

  it("abre automáticamente al detectar intención de arrastre hacia la derecha", () => {
    expect(CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD).toBe(
      CHAT_NAVIGATION_POINTER_SLOP,
    );

    expect(
      resizeChatNavigationFromRail({
        startX: 100 + CHAT_NAVIGATION_RAIL_WIDTH,
        currentX:
          100 +
          CHAT_NAVIGATION_RAIL_WIDTH -
          CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD,
      }),
    ).toEqual({ expand: false, width: CHAT_NAVIGATION_WIDTH_MIN });

    expect(
      resizeChatNavigationFromRail({
        startX: 100 + CHAT_NAVIGATION_RAIL_WIDTH,
        currentX:
          100 +
          CHAT_NAVIGATION_RAIL_WIDTH +
          CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD -
          1,
      }),
    ).toEqual({ expand: false, width: CHAT_NAVIGATION_WIDTH_MIN });

    expect(
      resizeChatNavigationFromRail({
        startX: 100 + CHAT_NAVIGATION_RAIL_WIDTH,
        currentX:
          100 +
          CHAT_NAVIGATION_RAIL_WIDTH +
          CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD,
      }),
    ).toEqual({ expand: true, width: CHAT_NAVIGATION_WIDTH_MIN });
  });

  it("abre siempre en el mínimo aunque el primer arrastre sea largo", () => {
    expect(
      resizeChatNavigationFromRail({
        startX: 100 + CHAT_NAVIGATION_RAIL_WIDTH,
        currentX:
          100 +
          CHAT_NAVIGATION_RAIL_WIDTH +
          CHAT_NAVIGATION_RAIL_EXPAND_DRAG_THRESHOLD +
          1,
      }),
    ).toEqual({ expand: true, width: CHAT_NAVIGATION_WIDTH_MIN });

    expect(
      resizeChatNavigationFromRail({
        startX: 100 + CHAT_NAVIGATION_RAIL_WIDTH,
        currentX: 900,
      }),
    ).toEqual({ expand: true, width: CHAT_NAVIGATION_WIDTH_MIN });
  });
});
