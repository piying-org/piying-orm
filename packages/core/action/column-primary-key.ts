export type PrimaryKeyOptions = {
  primary?: boolean;
  generated?: boolean | 'increment' | 'uuid' | 'rowid';
};

import { rawConfig } from './raw-config';
import { EntitySchemaIndexOptions } from 'typeorm';
export type ColumnPrimarykeyOptions = Omit<EntitySchemaIndexOptions, 'columns'>;
export function columnPrimaryKey<T>(value: PrimaryKeyOptions) {
  return rawConfig<T>((field) => {
    field.primaryKey = { primary: true, ...value };
  });
}
