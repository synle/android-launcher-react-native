export interface InstalledApp {
  packageName: string;
  appName: string;
  /** Base64-encoded PNG icon */
  icon: string;
}

export interface GridConfig {
  columns: number;
  iconSize: number;
  labelSize: number;
  showLabels: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedApp: InstalledApp | null;
  originIndex: number;
  currentIndex: number;
}
