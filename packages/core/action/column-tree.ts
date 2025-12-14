import { OnDeleteType } from 'typeorm/metadata/types/OnDeleteType.js';
import { rawConfig } from './raw-config';
import { ColumnRelationOptions } from './column-relation';
export function columnTreeChildren<T>(value?: {
  cascade?:
    | boolean
    | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[];
}) {
  return rawConfig<T>((field) => {
    (field.relation as Omit<ColumnRelationOptions<any>, 'target'>) = {
      ...field.relation,
      ...value,
      cascade: value?.cascade,
      type: 'one-to-many',
      treeChildren: true,
    };
  });
}
export function columnTreeParent<T>(value?: { onDelete?: OnDeleteType }) {
  return rawConfig<T>((field) => {
    (field.relation as Omit<ColumnRelationOptions<any>, 'target'>) = {
      ...field.relation,
      ...value,
      type: 'many-to-one',
      treeParent: true,
    };
  });
}
