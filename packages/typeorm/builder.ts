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
  #buildChild(entity: AnyCoreSchemaHandle):
    | {
        indexItem?: EntitySchemaIndexOptions;
        relationItem?: EntitySchemaRelationOptions;
        relationIdItem?: NonNullable<EntitySchemaRelationIdOptions>[string];
        embeddedItem?: EntitySchemaEmbeddedColumnOptions;
        columnItem: EntitySchemaColumnOptions;
      }
    | undefined {
    if (entity.noColumn) {
      return;
    }
    const options: EntitySchemaColumnOptions = {} as any;
    let indexItem: EntitySchemaIndexOptions | undefined;
    let relationItem: EntitySchemaRelationOptions | undefined;
    let relationIdItem:
      | NonNullable<EntitySchemaRelationIdOptions>[string]
      | undefined;
    let embeddedItem: EntitySchemaEmbeddedColumnOptions | undefined;
    let columnItem = {} as EntitySchemaColumnOptions;
    if (!entity.formConfig.required) {
      options.nullable = true;
    }
    if (entity.props?.['description'] || entity.props?.['title']) {
      options.comment = [entity.props?.['title'], entity.props?.['description']]
        .filter(Boolean)
        .join(';');
    }
    options.default = entity.formConfig.defaultValue;
    if (entity.type === 'picklist' || entity.type === 'enum') {
      let firstType = typeof entity.props!['options'][0];
      options.type = this.#config.defaultConfig?.types[firstType]?.type;
      options.enum = entity.props!['options'];
    } else {
      options.type = this.#config.defaultConfig?.types[entity.type!]?.type;
    }

    if (entity.primaryKey) {
      options.primary = entity.primaryKey.primary;
      if (entity.primaryKey.generated) {
        options.generated = entity.primaryKey.generated;
      }
    }

    if (entity.foreignKey) {
      options.foreignKey = {
        ...entity.foreignKey,
        target: this.#getForeignKey(entity.foreignKey!.target),
      };
    }
    if (entity.index) {
      indexItem = {
        ...entity.index,
        columns: [entity.key! as any],
      };
    }
    if (entity.relation) {
      // tree bind self
      if (entity.relation.treeChildren || entity.relation.treeParent) {
        entity.relation.target = () => entity.parent!.sourceSchema;
      }
      relationItem = {
        ...entity.relation,
        target: () => this.#entityMap.get((entity.relation! as any).target()),
      };
    } else if (entity.relationId) {
      relationIdItem = entity.relationId;
      columnItem = { ...options, ...entity.columnSchema };
    } else if (entity.arrayChild) {
      let child = entity.arrayChild;
      if (child.sourceSchema.type === 'object') {
        let schema = this.buildEntity(child, entity.key! as string);
        embeddedItem = { schema, array: true, ...entity.embedded };
      } else {
        let childResult = this.#buildChild(child);
        columnItem = childResult?.columnItem!;
        indexItem = childResult?.indexItem;
      }
      columnItem.array = true;
    } else if (entity.children && entity.children.length) {
      let schema = this.buildEntity(entity, entity.key as string);
      embeddedItem = { schema, ...entity.embedded };
    } else if (entity.embedded) {
      embeddedItem = entity.embedded as any;
    } else {
      columnItem = { ...options, ...entity.columnSchema };
    }
    return {
      columnItem,
      indexItem,
      relationItem,
      relationIdItem,
      embeddedItem,
    };
  }
  buildEntity(entity: AnyCoreSchemaHandle, key: string) {
    const columns = {} as Record<string, EntitySchemaColumnOptions>;
    const indexList: EntitySchemaIndexOptions[] = [];
    const relations: Record<string, EntitySchemaRelationOptions> = {};
    const relationIds: EntitySchemaRelationIdOptions = {};
    let embeddeds: Record<string, EntitySchemaEmbeddedColumnOptions> = {};
    for (const item of entity.children) {
      let result = this.#buildChild(item);
      if (result?.indexItem) {
        indexList.push(result.indexItem);
      }
      if (result?.relationItem) {
        relations[item.key!] = result?.relationItem;
      } else if (result?.relationIdItem) {
        relationIds[item.key!] = result?.relationIdItem;
        columns[item.key!] = result.columnItem;
      } else if (result?.embeddedItem) {
        embeddeds[item.key!] = result.embeddedItem;
      } else if (result?.columnItem) {
        columns[item.key!] = result.columnItem;
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
