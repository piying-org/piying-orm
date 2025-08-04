import { Merge, SetOptional } from '../../util';
import { rawConfig } from '../raw-config';
import type {
  DataSource,
  SelectQueryBuilder,
  EntitySchemaOptions as TSO,
} from 'typeorm';
import * as v from 'valibot';
export type EntitySchemaOptions = SetOptional<
  NonNullable<Omit<TSO<any>, 'columns'>>,
  'name'
>;
export function entity<T>(value: Partial<EntitySchemaOptions>) {
  return rawConfig<T>((field) => {
    field.tableSchema = { ...field.tableSchema, ...value };
  });
}
export type ViewEntitySchemaOptions = Merge<
  Omit<EntitySchemaOptions, 'type'>,
  {
    expression:
      | string
      | ((
          connection: DataSource,
          instance: { getEntity: (arg: v.BaseSchema<any, any, any>) => any },
        ) => SelectQueryBuilder<any>);
  }
>;
export function viewEntity<T>(value: ViewEntitySchemaOptions) {
  return rawConfig<T>((field) => {
    field.tableSchema = {
      ...field.tableSchema,
      ...(value as any),
      type: 'view',
    };
  });
}
