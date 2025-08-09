import { DataSourceOptions } from 'typeorm';
import { convert } from '../../convert';
import * as v from 'valibot';
export type InputTuple<T> = {
  [K in keyof T]: T[K];
};
export async function createInstance<
  EntityObj extends Record<string, v.BaseSchema<any, any, any>>,
>(
  list: EntityObj,
  dataSourceOptions?: Partial<DataSourceOptions>,
  options?: { disableInit?: boolean },
) {
  const instance = convert(list, {
    dataSourceOptions: {
      type: 'better-sqlite3',
      database: ':memory:',
      logging: true,
      synchronize: true,
      ...dataSourceOptions,
    } as DataSourceOptions,
  });
  if (!options?.disableInit) {
    await instance.dataSource.initialize();
  }
  return instance;
}
