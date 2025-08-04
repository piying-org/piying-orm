import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';
export type EntitySchemaExclusionOptions = NonNullable<
  EntitySchemaOptions<any>['exclusions']
>;
export function entityExclusion<T>(value: EntitySchemaExclusionOptions) {
  return rawConfig<T>((field) => {
    field.tableSchema.exclusions = value;
  });
}
