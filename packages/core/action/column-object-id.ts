import { rawConfig } from './raw-config';
export function columnObjectId<T>() {
  return rawConfig<T>((field) => {
    field.columnSchema ??= {} as any;
    field.columnSchema!.objectId = true;
    field.columnSchema!.primary = true;
  });
}
