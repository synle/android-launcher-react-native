import React, { useState, useMemo, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { AppGrid } from './components/AppGrid';
import { SearchBar } from './components/SearchBar';
import { DragOverlay } from './components/DragOverlay';
import { useInstalledApps } from './hooks/useInstalledApps';
import { DEFAULT_GRID_CONFIG, COLORS } from './utils/constants';
import type { InstalledApp, DragState, GridConfig } from './types/app';

export default function App() {
  const { apps, loading, error, refresh } = useInstalledApps();
  const [searchQuery, setSearchQuery] = useState('');
  const [gridConfig] = useState<GridConfig>(DEFAULT_GRID_CONFIG);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedApp: null,
    originIndex: -1,
    currentIndex: -1,
  });

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;

    const query = searchQuery.toLowerCase().trim();
    return apps.filter(
      app =>
        app.appName.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query),
    );
  }, [apps, searchQuery]);

  const handleAppLongPress = useCallback(
    (app: InstalledApp) => {
      const index = apps.findIndex(a => a.packageName === app.packageName);
      setDragState({
        isDragging: true,
        draggedApp: app,
        originIndex: index,
        currentIndex: index,
      });
    },
    [apps],
  );

  const handleDragCancel = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedApp: null,
      originIndex: -1,
      currentIndex: -1,
    });
  }, []);

  if (loading && apps.length === 0) {
    return (
      <View style={styles.centered}>
        <StatusBar translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    );
  }

  if (error && apps.length === 0) {
    return (
      <View style={styles.centered}>
        <StatusBar translucent backgroundColor="transparent" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.header}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <Text style={styles.appCount}>
          {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <AppGrid
        apps={filteredApps}
        gridConfig={gridConfig}
        onAppLongPress={handleAppLongPress}
      />

      <DragOverlay dragState={dragState} onCancel={handleDragCancel} />

      {dragState.isDragging && (
        <TouchableOpacity
          style={styles.cancelDrag}
          onPress={handleDragCancel}
          activeOpacity={0.8}>
          <Text style={styles.cancelText}>Tap to cancel</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: StatusBar.currentHeight ?? 44,
  },
  header: {
    paddingTop: 8,
  },
  appCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textPrimary,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  cancelDrag: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
