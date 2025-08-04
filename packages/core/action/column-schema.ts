import { rawConfig } from './raw-config';
import { EntitySchemaColumnOptions as TSCO } from 'typeorm';
// export {EntitySchemaColumnOptions}
export type ColumnSchemaOptions = Omit<TSCO, 'foreignKey' | 'primaryKey'>;
export function column<T>(value?: Partial<ColumnSchemaOptions>) {
  return rawConfig<T>((field) => {
    field.columnSchema = value ?? ({} as any);
  });
}
export function noColumn<T>(value = true) {
  return rawConfig<T>((field) => {
    field.noColumn = value;
  });
}
// todo 需要改逻辑和tree一样
export function virtualColumn<T>(value?: Partial<ColumnSchemaOptions>) {
  return rawConfig<T>((field) => {});
}
