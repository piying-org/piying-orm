import {
  ArraySchema,
  BaseSchema,
  BaseIssue,
  ErrorMessage,
  ArrayIssue,
} from 'valibot';

import * as v from 'valibot';

import {
  BaseSchemaHandle,
  convertSchema,
  DefaultSchema,
  EnumSchema,
  IntersectSchema,
  MetadataAction,
  Schema,
  SchemaOrPipe,
  TupleSchema,
  UnionSchema,
  VoidSchema,
} from '@piying/valibot-visit';
import { FieldFormConfig } from './type';
import { PrimaryKeyOptions } from './action/column-primary-key';
import { ForginKeyOptions } from './action/column-foreign-key';
import { ColumnkeyIndexOptions } from './action/column-index';
import { EntitySchemaOptions } from './action/entity/entity-schema';
import type {
  EntitySchemaColumnOptions,
  EntitySchemaEmbeddedColumnOptions,
} from 'typeorm';
import {
  ColumnRelationIdOptions,
  ColumnRelationOptions,
} from './action/column-relation';

export class OrmCoreSchemaHandle<
  Self extends OrmCoreSchemaHandle<any>,
> extends BaseSchemaHandle<Self> {
  /** table */
  tableSchema: EntitySchemaOptions = {} as any;
  // checks?: EntitySchemaCheckOptions[];
  // indices?: EntitySchemaIndexOptions[];
  // uniques?: EntitySchemaUniqueOptions[];
  // exclusions?: EntitySchemaExclusionOptions[];
  // embeddeds?: EntitySchemaEmbeddedColumnOptionsObj;
  // foreignKeys?: EntitySchemaForeignKeyOptions[];
  /** column */
  // tableName?: TableNameOptions;
  relation?: ColumnRelationOptions<any>;
  relationId?: ColumnRelationIdOptions;
  columnSchema?: EntitySchemaColumnOptions = undefined;
  primaryKey?: PrimaryKeyOptions;
  foreignKey?: ForginKeyOptions;
  index?: ColumnkeyIndexOptions;
  // unique?: boolean;
  formConfig: FieldFormConfig = {} as any;
  embedded?: Partial<EntitySchemaEmbeddedColumnOptions>;

  id?: string;
  isLogicAnd = false;
  isLogicOr = false;
  isArray = false;
  isTuple = false;
  noColumn = false;

  length?: number;
  override arraySchema(
    schema: ArraySchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<ArrayIssue> | undefined
    >,
  ): void {
    if (this.isObjectControl) {
      // 不需要设置默认值,因为item属于模板
      return;
    } else {
      this.isArray = true;
      const sh = new this.globalConfig.handle(this.globalConfig, this, schema);
      convertSchema(schema.item as SchemaOrPipe, sh);
      this.arrayChild = sh;
    }
  }

  override defaultSchema(schema: DefaultSchema): void {
    this.defaultValue = schema.literal;
  }
  override tupleDefault(schema: TupleSchema): void {
    super.tupleDefault(schema);
    this.isTuple = true;
  }
  override enumSchema(schema: EnumSchema): void {
    this.props ??= {};
    this.props['options'] ??= schema.options;
  }
  override intersectBefore(schema: IntersectSchema): void {
    this.isLogicAnd = true;
  }
  override logicItemSchema(
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    index: number,
    type: 'intersect' | 'union',
  ): void {
    const sh = new this.globalConfig.handle(this.globalConfig, this, schema);
    sh.parent = this.parent;
    convertSchema(schema as SchemaOrPipe, sh);
    sh.children.forEach((item: AnyCoreSchemaHandle) => {
      item.parent = this;
    });
    this.children.push(...sh.children);
  }
  unionSchema(schema: UnionSchema): void {
    this.isObjectControl = true;
    return super.unionSchema(schema);
  }
  override unionBefore(schema: UnionSchema): void {
    if (this.childrenAsVirtualGroup) {
      // 这个参数并不应该出现到这里,因为是专门为intersect设计
    } else {
      this.isLogicOr = true;
    }
  }

  override beforeSchemaType(schema: Schema): void {
    super.beforeSchemaType(schema);
    this.formConfig.required = !this.undefinedable && !this.nullable;
  }
  override voidSchema(schema: VoidSchema): void {
    this.key = undefined;
    this.noColumn = true;
  }
  override metadataHandle(
    metadata: MetadataAction,
    environments: string[],
    workOn: any,
  ): void {
    switch (metadata.type as any) {
      case 'ormRawConfig': {
        (metadata as any).value(this as any, this.globalConfig.context);
        break;
      }

      default:
        super.metadataHandle(metadata, environments, workOn);
        break;
    }
  }
  override end(schema: SchemaOrPipe): void {
    super.end(schema);
    this.formConfig.defaultValue = this.defaultValue;
  }
}
export type AnyCoreSchemaHandle = OrmCoreSchemaHandle<AnyCoreSchemaHandle>;
