import { createRawConfig } from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '../core.schema-handle';
export const rawConfig = createRawConfig<'ormRawConfig', AnyCoreSchemaHandle>(
  'ormRawConfig',
);
