import React, { useCallback, memo } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import LauncherModule from '../native/LauncherModule';
import type { InstalledApp, GridConfig } from '../types/app';
import { calculateCellWidth, COLORS } from '../utils/constants';

interface AppIconProps {
  app: InstalledApp;
  gridConfig: GridConfig;
  onLongPress?: (app: InstalledApp) => void;
}

function AppIconComponent({ app, gridConfig, onLongPress }: AppIconProps) {
  const cellWidth = calculateCellWidth(gridConfig.columns);

  const handlePress = useCallback(async () => {
    try {
      await LauncherModule.launchApp(app.packageName);
    } catch (err) {
      console.error(`Failed to launch ${app.packageName}:`, err);
    }
  }, [app.packageName]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(app);
  }, [app, onLongPress]);

  return (
    <TouchableOpacity
      style={[styles.container, { width: cellWidth }]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={300}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: `data:image/png;base64,${app.icon}` }}
          style={[
            styles.icon,
            { width: gridConfig.iconSize, height: gridConfig.iconSize },
          ]}
          resizeMode="contain"
        />
      </View>
      {gridConfig.showLabels && (
        <Text
          style={[styles.label, { fontSize: gridConfig.labelSize }]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {app.appName}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    borderRadius: 12,
  },
  label: {
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export const AppIcon = memo(AppIconComponent);
