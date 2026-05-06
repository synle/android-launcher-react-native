import React, { memo } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import type { DragState } from '../types/app';

/**
 * Drag-and-drop overlay placeholder.
 *
 * This is the visual foundation for drag-and-drop reordering.
 * In the MVP, long-pressing an app will show this overlay.
 *
 * Full implementation would require:
 * - PanResponder or react-native-gesture-handler for drag tracking
 * - Animated.Value for smooth position interpolation
 * - Grid position calculation for drop targets
 * - Persistent storage for custom app order
 *
 * This component renders the dragged icon as an overlay when active.
 */
interface DragOverlayProps {
  dragState: DragState;
  onCancel: () => void;
}

function DragOverlayComponent({ dragState }: DragOverlayProps) {
  if (!dragState.isDragging || !dragState.draggedApp) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.dragContainer}>
        <Image
          source={{ uri: `data:image/png;base64,${dragState.draggedApp.icon}` }}
          style={styles.dragIcon}
        />
        <Text style={styles.hint}>Drag & drop coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dragContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  dragIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 12,
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
});

export const DragOverlay = memo(DragOverlayComponent);
