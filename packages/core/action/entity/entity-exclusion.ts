import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';
export type EntitySchemaExclusionOptions = NonNullable<
  EntitySchemaOptions<any>['exclusions']
>[number];
export function entityExclusion<T>(value: EntitySchemaExclusionOptions) {
  return rawConfig<T>((field) => {
    field.tableSchema.exclusions ??= [];
    field.tableSchema.exclusions.push(value);
  });
}
