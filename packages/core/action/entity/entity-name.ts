import { rawConfig } from '../raw-config';

export function entityName<T>(value: string) {
  return rawConfig<T>((field) => {
    field.tableSchema.tableName = value;
  });
}
