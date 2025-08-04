import { rawConfig } from '../raw-config';
import type { EntitySchemaIndexOptions as TESO } from 'typeorm';
export type EntitySchemaIndexOptions<Column extends string> = Omit<
  TESO,
  'columns'
> & {
  columns: Exclude<TESO['columns'], string[]> | Column[];
};

export function entityIndex<T, B = T>(
  value: EntitySchemaIndexOptions<Extract<keyof B, string>>[],
) {
  return rawConfig<T>((field) => {
    field.tableSchema.indices = value;
  });
}
