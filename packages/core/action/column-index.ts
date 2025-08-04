import { rawConfig } from './raw-config';
import { EntitySchemaIndexOptions } from 'typeorm';
export type ColumnkeyIndexOptions = Omit<EntitySchemaIndexOptions, 'columns'>;
export function columnIndex<T>(value?: ColumnkeyIndexOptions) {
  return rawConfig<T>((field) => {
    field.index = value ?? {};
  });
}
