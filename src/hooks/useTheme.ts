"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  applyTheme,
  readServerTheme,
  readTheme,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";

/**
 * Subscribes to the shared theme store so every toggle on the page agrees,
 * and so the icon settles to the saved theme right after hydration.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readTheme,
    readServerTheme,
  );

  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  const toggle = useCallback(
    () => applyTheme(readTheme() === "light" ? "dark" : "light"),
    [],
  );

  return { theme, setTheme, toggle };
}
