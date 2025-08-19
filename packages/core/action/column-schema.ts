import { rawConfig } from './raw-config';
import { ColumnType, EntitySchemaColumnOptions as TSCO } from 'typeorm';
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
export interface ColumnVirtualOptions {
  query: NonNullable<ColumnSchemaOptions['query']>;
  type?: ColumnType;
  hstoreType?: ColumnSchemaOptions['hstoreType'];
}
export function columnVirtual<T>(options: ColumnVirtualOptions) {
  return rawConfig<T>((field) => {
    field.columnSchema ??= {} as any;
    field.columnSchema!.virtualProperty = true;
    if (options.type === 'hstore' && !options.hstoreType) {
      field.columnSchema!.hstoreType = field.isGroup ? 'object' : 'string';
    }
    field.columnSchema!.query = options.query;
  });
}
