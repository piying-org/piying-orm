import { rawConfig } from './raw-config';
import type { EntitySchemaEmbeddedColumnOptions, EntitySchemaOptions } from 'typeorm';

export function embedded<T>(value: Partial<EntitySchemaEmbeddedColumnOptions>) {
  return rawConfig<T>((field) => {
    field.embedded = value;
  });
}
