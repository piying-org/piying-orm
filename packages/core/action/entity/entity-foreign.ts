import { Merge } from '../../util';
import { rawConfig } from '../raw-config';
import type { EntitySchemaOptions } from 'typeorm';
import * as v from 'valibot';
type EntitySchemaForeignKeyOption = NonNullable<
  EntitySchemaOptions<any>['foreignKeys']
>[number];
export type EntitySchemaForeignKeyOptions<
  Target extends v.BaseSchema<any, any, any>,
> = Merge<
  EntitySchemaForeignKeyOption,
  {
    target: string | (() => Target);
    referencedColumnNames: Extract<keyof v.InferOutput<Target>, string>[];
  }
>;

export function entityForeignKey<T, C extends v.BaseSchema<any, any, any>>(
  value: EntitySchemaForeignKeyOptions<C>[],
) {
  return rawConfig<T>((field) => {
    field.tableSchema.foreignKeys = value;
  });
}
