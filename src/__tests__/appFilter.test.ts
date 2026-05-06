import { filterApps, sortAppsAlphabetical } from '../utils/appFilter';
import type { InstalledApp } from '../types/app';

const app = (appName: string, packageName: string): InstalledApp => ({
  appName,
  packageName,
  icon: '', // base64 icon — not used by these tests
});

const APPS: InstalledApp[] = [
  app('Calendar', 'com.google.android.calendar'),
  app('Camera', 'com.samsung.android.camera'),
  app('Chrome', 'com.android.chrome'),
  app('Spotify', 'com.spotify.music'),
  app('Messages', 'com.samsung.android.messaging'),
];

describe('filterApps — happy path', () => {
  it('returns full list for empty query', () => {
    expect(filterApps(APPS, '')).toEqual(APPS);
  });

  it('returns full list for whitespace-only query', () => {
    expect(filterApps(APPS, '   ')).toEqual(APPS);
  });

  it('matches by app name (case-insensitive)', () => {
    const result = filterApps(APPS, 'CA');
    expect(result.map((a) => a.appName)).toEqual(['Calendar', 'Camera']);
  });

  it('matches by package name', () => {
    const result = filterApps(APPS, 'samsung');
    expect(result.map((a) => a.packageName).sort()).toEqual([
      'com.samsung.android.camera',
      'com.samsung.android.messaging',
    ]);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterApps(APPS, 'tiktok')).toEqual([]);
  });
});

describe('filterApps — edge cases', () => {
  it('trims surrounding whitespace from query', () => {
    expect(filterApps(APPS, '  spotify  ').map((a) => a.appName)).toEqual([
      'Spotify',
    ]);
  });

  it('handles empty input list', () => {
    expect(filterApps([], 'anything')).toEqual([]);
  });

  it('treats package-name match as a hit even when label does not match', () => {
    const apps = [app('Music', 'com.spotify.music')];
    expect(filterApps(apps, 'spotify')).toHaveLength(1);
  });
});

describe('sortAppsAlphabetical', () => {
  it('orders labels case-insensitively', () => {
    const apps = [app('Zoom', 'a'), app('chrome', 'b'), app('Bitwarden', 'c')];
    expect(sortAppsAlphabetical(apps).map((a) => a.appName)).toEqual([
      'Bitwarden',
      'chrome',
      'Zoom',
    ]);
  });

  it('breaks ties by package name (stable, deterministic)', () => {
    const apps = [
      app('Photos', 'com.samsung.photos'),
      app('Photos', 'com.google.photos'),
    ];
    expect(sortAppsAlphabetical(apps).map((a) => a.packageName)).toEqual([
      'com.google.photos',
      'com.samsung.photos',
    ]);
  });

  it('sinks blank-labeled apps to the end', () => {
    const apps = [app('', 'com.broken'), app('Chrome', 'com.android.chrome')];
    expect(sortAppsAlphabetical(apps).map((a) => a.appName)).toEqual(['Chrome', '']);
  });

  it('does not mutate the input', () => {
    const original = [app('Zoom', 'a'), app('Bitwarden', 'b')];
    const copy = [...original];
    sortAppsAlphabetical(original);
    expect(original).toEqual(copy);
  });

  it('returns empty array unchanged', () => {
    expect(sortAppsAlphabetical([])).toEqual([]);
  });
});
