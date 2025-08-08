import {
  EntitySchema,
  EntitySchemaColumnOptions,
  EntitySchemaEmbeddedColumnOptions,
  EntitySchemaIndexOptions,
  EntitySchemaRelationOptions,
  EntityTarget,
} from 'typeorm';
import { inject } from 'static-injector';
import {
  AnyCoreSchemaHandle,
  PI_ORM_CONFIG_TOKEN,
  OrmBuilder,
} from '@piying/orm/core';
import { EntitySchemaRelationIdOptions } from '@piying/orm/core';
import { DataSource } from 'typeorm/browser';
function createTarget(name: string) {
  return {
    [name]: function () {},
  }[name];
}
export class TypeormBuilder extends OrmBuilder {
  #entityMap = new Map<any, () => void>();
  #config = inject(PI_ORM_CONFIG_TOKEN);
  buildEntitys(list: Record<string, AnyCoreSchemaHandle>): any {
    return Object.entries(list).reduce(
      (obj, [key, value]) => {
        const result = this.buildEntity(value, key);
        obj[key] = result;
        return obj;
      },
      {} as Record<string, EntitySchema>,
    );
  }
  #getForeignKey(input: EntityTarget<any>) {
    return typeof input === 'string'
      ? input
      : () => {
          return this.#entityMap.get((input as any)())!;
        };
  }
  buildEntity(entity: AnyCoreSchemaHandle, key: string) {
    const columns = {} as Record<string, EntitySchemaColumnOptions>;
    const indexList: EntitySchemaIndexOptions[] = [];
    const relations: Record<string, EntitySchemaRelationOptions> = {};
    const relationIds: EntitySchemaRelationIdOptions = {};
    let embeddeds: Record<string, EntitySchemaEmbeddedColumnOptions> = {};
    for (const item of entity.children) {
      if (item.noColumn) {
        continue;
      }
      const options: EntitySchemaColumnOptions = {} as any;
      if (!item.formConfig.required) {
        options.nullable = true;
      }
      if (item.props?.['description'] || item.props?.['title']) {
        options.comment = [item.props?.['title'], item.props?.['description']]
          .filter(Boolean)
          .join(';');
      }
      options.default = item.formConfig.defaultValue;
      if (item.type === 'picklist' || item.type === 'enum') {
        let firstType = typeof item.props!['options'][0];
        options.type = this.#config.defaultConfig?.types[firstType]?.type;
        options.enum = item.props!['options'];
      } else {
        options.type = this.#config.defaultConfig?.types[item.type!]?.type;
      }

      if (item.primaryKey) {
        options.primary = item.primaryKey.primary;
        if (item.primaryKey.generated) {
          options.generated = item.primaryKey.generated;
        }
      }

      if (item.foreignKey) {
        options.foreignKey = {
          ...item.foreignKey,
          target: this.#getForeignKey(item.foreignKey!.target),
        };
      }
      if (item.index) {
        indexList.push({
          ...item.index,
          columns: [item.key! as any],
        });
      }
      if (item.relation) {
        relations[item.key!] = {
          ...item.relation,
          target: () => this.#entityMap.get((item.relation! as any).target()),
        };
      } else if (item.relationId) {
        relationIds[item.key!] = item.relationId;
        if (item.columnSchema) {
          columns[item.key!] = { ...options, ...item.columnSchema };
        }
      } else if (item.children && item.children.length) {
        let schema = this.buildEntity(item, item.key as string);
        embeddeds[item.key!] = { schema, ...item.embedded };
      } else if (item.embedded) {
        embeddeds[item.key!] = item.embedded as any;
      } else {
        columns[item.key!] = { ...options, ...item.columnSchema };
      }
    }
    if (entity.tableSchema.expression) {
      const oldExpression = entity.tableSchema.expression as any;
      entity.tableSchema.expression =
        typeof entity.tableSchema.expression === 'string'
          ? entity.tableSchema.expression
          : (dataSource: DataSource) =>
              oldExpression(dataSource, {
                getEntity: (input: any) => this.#entityMap.get(input),
              });
    }
    const name = entity.tableSchema.name ?? key;
    const target = createTarget(name);
    const instance = new EntitySchema({
      ...entity.tableSchema,
      target,
      name,
      tableName: entity.tableSchema.tableName ?? key,
      columns: columns,
      indices: [...(entity.tableSchema.indices ?? []), ...indexList],
      relations: {
        ...entity.tableSchema.relations,
        ...relations,
      },
      relationIds: {
        ...entity.tableSchema.relationIds,
        ...relationIds,
      },
      foreignKeys: entity.tableSchema.foreignKeys?.map((item) => ({
        ...item,
        target: this.#getForeignKey(item.target),
      })),
      embeddeds: { ...entity.tableSchema.embeddeds, ...embeddeds },
    });
    this.#entityMap.set(entity.sourceSchema, target);
    return instance;
  }
}
