import type { InstalledApp } from '../types/app';

/**
 * Filters an installed-app list by a free-text search query.
 * Matches against `appName` (display label) and `packageName` (technical id).
 * A blank/whitespace-only query returns the original list unchanged.
 */
export function filterApps(apps: InstalledApp[], query: string): InstalledApp[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return apps;

  return apps.filter(
    (app) =>
      app.appName.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q),
  );
}

/**
 * Sorts apps alphabetically by display name (case-insensitive). Apps with
 * blank labels sink to the end. Tie-broken by package name for stability.
 */
export function sortAppsAlphabetical(apps: InstalledApp[]): InstalledApp[] {
  return [...apps].sort((a, b) => {
    const aBlank = a.appName.trim() === '';
    const bBlank = b.appName.trim() === '';
    if (aBlank !== bBlank) return aBlank ? 1 : -1;

    const labelCmp = a.appName.toLowerCase().localeCompare(b.appName.toLowerCase());
    if (labelCmp !== 0) return labelCmp;
    return a.packageName.localeCompare(b.packageName);
  });
}
