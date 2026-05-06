import { Dimensions } from 'react-native';
import type { GridConfig } from '../types/app';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 4,
  iconSize: 56,
  labelSize: 11,
  showLabels: true,
};

export const GRID_HORIZONTAL_PADDING = 16;

export function calculateCellWidth(columns: number): number {
  return (SCREEN_WIDTH - GRID_HORIZONTAL_PADDING * 2) / columns;
}

export const COLORS = {
  background: 'transparent',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  searchBackground: 'rgba(255, 255, 255, 0.15)',
  searchText: '#FFFFFF',
  searchPlaceholder: 'rgba(255, 255, 255, 0.6)',
  errorText: '#FF6B6B',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const;
