import * as v from 'valibot';
import { ConvertOptions } from '@piying/valibot-visit';
import { Injector } from 'static-injector';
import {
  convertOrm,
  DefaultOrmConfig,
  OrmCoreSchemaHandle,
  OrmBuilder,
} from '@piying/orm/core';
import { TypeormSchemaHandle } from './schema-handle';
import { TypeormBuilder } from './builder';
import { DataSource, DataSourceOptions, EntitySchema } from 'typeorm';

// export type SchemaToType<T> = {
//   [K in keyof T]: T[K] extends v.BaseSchema<any, any, any> ? v.InferOutput<T[K]> : {};
// };
// export type SchemaToRepo<T> = {
//   [K in keyof T]: T[K] extends v.BaseSchema<any, any, any> ?Repository<v.InferOutput<T[K]>>  : {};
// };
export type SchemaToEntitySchema<T> = {
  [K in keyof T]: T[K] extends v.BaseSchema<any, any, any>
    ? EntitySchema<v.InferOutput<T[K]>>
    : object;
};
export type InputTuple<T extends Record<string, v.BaseSchema<any, any, any>>> =
  {
    [K in keyof T]: EntitySchema<v.InferOutput<T[K]>>;
  };
export function convert<
  EntityObj extends Record<string, v.BaseSchema<any, any, any>>,
  T extends typeof OrmCoreSchemaHandle,
  B extends typeof OrmBuilder,
>(
  list: EntityObj,
  options: Omit<ConvertOptions, 'handle'> & {
    injector?: Injector;
    builder?: B;
    handle?: T;
    dataSourceOptions: DataSourceOptions;
    defaultConfig?: DefaultOrmConfig;
  },
) {
  const entityObj = convertOrm(list, {
    ...options,
    builder: options.builder ?? TypeormBuilder,
    handle: options.handle ?? (TypeormSchemaHandle as T),
  }) as any;

  const dataSource = new DataSource({
    ...options.dataSourceOptions,
    entities: Object.values(entityObj),
  });

  return {
    object: entityObj as InputTuple<EntityObj>,
    dataSource: dataSource,
  };
}
