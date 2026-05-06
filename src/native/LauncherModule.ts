import { NativeModules } from 'react-native';
import type { InstalledApp } from '../types/app';

interface LauncherModuleInterface {
  getInstalledApps(iconSize: number): Promise<InstalledApp[]>;
  launchApp(packageName: string): Promise<boolean>;
  openLauncherPicker(): Promise<boolean>;
}

const { LauncherModule } = NativeModules;

if (!LauncherModule) {
  throw new Error(
    'LauncherModule native module is not linked. ' +
      'Make sure you rebuilt the app after adding the native module.',
  );
}

export default LauncherModule as LauncherModuleInterface;
