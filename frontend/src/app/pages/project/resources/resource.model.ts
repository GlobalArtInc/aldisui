import type { UiIconName } from '@globalart/platform-ui';

export type ResourceCellKind = 'text' | 'mono' | 'badge' | 'bool';

export interface ResourceColumn {
  title: string;
  field: string;
  kind?: ResourceCellKind;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface ResourceConfig {
  titleKey: string;
  path: string;
  icon: UiIconName;
  emptyKey: string;
  columns: ResourceColumn[];
}
