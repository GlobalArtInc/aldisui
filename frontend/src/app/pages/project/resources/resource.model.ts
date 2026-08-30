import type { UiIconName } from '@globalart/platform-ui';

export type ResourceCellKind = 'text' | 'mono' | 'badge' | 'bool';

export type ResourceFieldType = 'text' | 'password' | 'textarea' | 'number' | 'switch' | 'select';

export type ResourceOptionSource = 'keys' | 'templates' | 'users';

export interface ResourceOption {
  label: string;
  value: string | number;
}

export interface ResourceField {
  name: string;
  label: string;
  type?: ResourceFieldType;
  required?: boolean;
  options?: ResourceOption[];
  source?: ResourceOptionSource;
  when?: { field: string; is: string[] };
  value?: string | number | boolean;
}

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
  createKey?: string;
  deleteKey?: string;
  askKey?: string;
  fields?: ResourceField[];
}
