import React, { useMemo, useCallback, memo } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ListRenderItemInfo,
} from 'react-native';
import { AppIcon } from './AppIcon';
import type { InstalledApp, GridConfig } from '../types/app';
import { GRID_HORIZONTAL_PADDING } from '../utils/constants';

interface AppGridProps {
  apps: InstalledApp[];
  gridConfig: GridConfig;
  onAppLongPress?: (app: InstalledApp) => void;
}

function AppGridComponent({ apps, gridConfig, onAppLongPress }: AppGridProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<InstalledApp>) => (
      <AppIcon
        app={item}
        gridConfig={gridConfig}
        onLongPress={onAppLongPress}
      />
    ),
    [gridConfig, onAppLongPress],
  );

  const keyExtractor = useCallback(
    (item: InstalledApp) => item.packageName,
    [],
  );

  const getItemLayout = useMemo(() => {
    const ITEM_HEIGHT = gridConfig.iconSize + 40; // icon + padding + label
    return (_data: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * Math.floor(index / gridConfig.columns),
      index,
    });
  }, [gridConfig.iconSize, gridConfig.columns]);

  return (
    <FlatList
      data={apps}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={gridConfig.columns}
      key={`grid-${gridConfig.columns}`} // Force re-render on column change
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
      windowSize={10}
      initialNumToRender={24}
      getItemLayout={getItemLayout}
      overScrollMode="never"
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingBottom: 100,
  },
});

export const AppGrid = memo(AppGridComponent);
