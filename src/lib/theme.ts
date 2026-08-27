export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "cc-theme";
export const DEFAULT_THEME: Theme = "dark";

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Kept as a string because it is injected as an inline <script>.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    document.documentElement.dataset.theme =
      stored === 'light' || stored === 'dark' ? stored : '${DEFAULT_THEME}';
  } catch (e) {
    document.documentElement.dataset.theme = '${DEFAULT_THEME}';
  }
})();
`.trim();

/* ------------------------------------------------------------------ */
/* Shared store                                                        */
/*                                                                     */
/* <html data-theme> is the single source of truth. The toggle appears  */
/* in more than one place (desktop header, mobile title bar, hero), so  */
/* every instance subscribes here rather than holding its own copy.     */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

export function subscribeToTheme(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Server and first-hydration render always assume the default. */
export function readServerTheme(): Theme {
  return DEFAULT_THEME;
}

export function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private browsing — the choice just won't persist.
  }
  for (const listener of listeners) listener();
}
