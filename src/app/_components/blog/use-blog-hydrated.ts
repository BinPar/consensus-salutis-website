"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Mantiene el primer render igual al HTML del servidor antes de aplicar preferencias. */
export function useBlogHydrated() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
