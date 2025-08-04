import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';

type OriginUnique = NonNullable<EntitySchemaOptions<any>['uniques']>[number];
export type EntitySchemaUniqueOptions<Key extends string> = (Omit<
  OriginUnique,
  'columns'
> & {
  columns: Exclude<OriginUnique['columns'], string[]> | Key[];
})[];
export function entityUnique<T, B = T>(
  value: EntitySchemaUniqueOptions<Extract<keyof B, string>>,
) {
  return rawConfig<T>((field) => {
    field.tableSchema.uniques = value;
  });
}
