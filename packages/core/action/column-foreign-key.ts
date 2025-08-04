import { rawConfig } from './raw-config';
import type { EntitySchemaColumnOptions } from 'typeorm';
type TypeormForeignKey = NonNullable<EntitySchemaColumnOptions['foreignKey']>;
export type ForginKeyOptions = Omit<TypeormForeignKey, 'target'> & {
  target: TypeormForeignKey['target'] | string | any;
};

export function columnForeignKey<T>(value: TypeormForeignKey) {
  return rawConfig<T>((field) => {
    field.foreignKey = value;
  });
}
