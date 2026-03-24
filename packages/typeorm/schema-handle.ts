import { OrmCoreSchemaHandle } from '@piying/orm/core';
import { SchemaOrPipe } from '@piying/valibot-visit';

export class TypeormSchemaHandle extends OrmCoreSchemaHandle<TypeormSchemaHandle> {
  override end(schema: SchemaOrPipe): void {
    super.end(schema);
    if (this.columnSchema?.type === 'simple-json') {
      this.formConfig.defaultValue = JSON.stringify(this.defaultValue);
    }
  }
}
