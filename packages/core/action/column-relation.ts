import { EntitySchemaOptions } from 'typeorm/browser';
import { rawConfig } from './raw-config';
import * as v from 'valibot';
export type ColumnRelationOptions<T extends v.BaseSchema<any, any, any>> = Omit<
  NonNullable<NonNullable<EntitySchemaOptions<any>['relations']>[string]>,
  'inverseSide' | 'target'
> & {
  target: string | (() => T);
  inverseSide?: Extract<keyof v.InferOutput<T>, string>;
};
type RelationType = ColumnRelationOptions<any>['type'];
function createRelation(type: RelationType) {
  return function columnOneToOne<T, C extends v.BaseSchema<any, any, any>>(
    value: Omit<ColumnRelationOptions<C>, 'type'>,
  ) {
    return rawConfig<T>((field) => {
      field.relation = {
        ...value,
        type: type,
      };
    });
  };
}
export const oneToOne = createRelation('one-to-one');
export const manyToOne = createRelation('many-to-one');
export const oneToMany = createRelation('one-to-many');
export const manyToMany = createRelation('many-to-many');
export type EntitySchemaRelationIdOptions =
  EntitySchemaOptions<any>['relationIds'];
export type ColumnRelationIdOptions = NonNullable<
  NonNullable<EntitySchemaOptions<any>['relationIds']>[string]
>;
export function columnRelationId<T>(value: ColumnRelationIdOptions) {
  return rawConfig<T>((field) => {
    field.relationId = value;
  });
}
