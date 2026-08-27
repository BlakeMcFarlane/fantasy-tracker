import { cache } from "react";

/**
 * One timestamp per server render, shared by every countdown on the page so
 * they all agree. Client components refine it after mount.
 */
export const getServerNow = cache((): number => Date.now());
