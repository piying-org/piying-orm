import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';
export type EntitySchemaCheckOptions = NonNullable<
  EntitySchemaOptions<any>['checks']
>;
export function entityCheck<T>(value: EntitySchemaCheckOptions) {
  return rawConfig<T>((field) => {
    field.tableSchema.checks = value;
  });
}
