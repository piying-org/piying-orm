import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';
export type EntitySchemaCheckOptions = NonNullable<
  EntitySchemaOptions<any>['checks']
>[number];
export function entityCheck<T>(value: EntitySchemaCheckOptions) {
  return rawConfig<T>((field) => {
    field.tableSchema.checks ??= [];
    field.tableSchema.checks.push(value);
  });
}
