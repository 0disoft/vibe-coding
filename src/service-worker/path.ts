/// <reference lib="webworker" />

export function createBasePathHelpers(base: string): {
  stripBase: (pathname: string) => string;
  addBase: (pathname: string) => string;
} {
  const hasBase = Boolean(base && base !== '/');
  const basePrefix = hasBase ? `${base}/` : '';

  function stripBase(pathname: string): string {
    if (!hasBase) return pathname;
    if (pathname.startsWith(basePrefix)) return pathname.slice(base.length);
    if (pathname === base) return '/';
    return pathname;
  }

  function addBase(pathname: string): string {
    if (!hasBase) return pathname;
    if (pathname === '/') return base;
    if (pathname === base) return pathname;
    if (pathname.startsWith(basePrefix)) return pathname;
    if (!pathname.startsWith('/')) pathname = `/${pathname}`;
    return `${base}${pathname}`;
  }

  return { stripBase, addBase };
}

