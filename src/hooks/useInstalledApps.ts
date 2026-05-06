import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import LauncherModule from '../native/LauncherModule';
import type { InstalledApp } from '../types/app';

const ICON_SIZE_PX = 192;

interface UseInstalledAppsResult {
  apps: InstalledApp[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useInstalledApps(): UseInstalledAppsResult {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const installedApps = await LauncherModule.getInstalledApps(ICON_SIZE_PX);

      // Sort alphabetically by app name
      const sorted = [...installedApps].sort((a, b) =>
        a.appName.localeCompare(b.appName, undefined, { sensitivity: 'base' }),
      );

      setApps(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load apps';
      setError(message);
      console.error('useInstalledApps:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when app returns to foreground (user may have installed/uninstalled apps)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          loadApps();
        }
        appStateRef.current = nextState;
      },
    );

    return () => subscription.remove();
  }, [loadApps]);

  // Initial load
  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return { apps, loading, error, refresh: loadApps };
}
