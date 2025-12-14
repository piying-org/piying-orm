import { AnyCoreSchemaHandle, OrmCoreSchemaHandle } from './core.schema-handle';

import { ConvertOptions, convertSchema } from '@piying/valibot-visit';
import { EnvironmentInjector, Injector } from 'static-injector';
import * as v from 'valibot';

import { PI_ORM_CONFIG_TOKEN } from './token';
import { OrmBuilder } from './builder';
import { DefaultOrmConfig } from './type';
import { DEFAULT_ORM_CONFIG } from './const';

export function convertOrm<
  T extends typeof OrmCoreSchemaHandle,
  B extends typeof OrmBuilder,
>(
  obj: Record<string, v.BaseSchema<any, any, any>>,
  options: Omit<ConvertOptions, 'handle'> & {
    injector?: Injector;
    builder?: B;
    handle?: T;
    registerOnDestroy?: (fn: any) => void;
    defaultConfig?: DefaultOrmConfig;
  },
) {
  const Builder = options.builder ?? OrmBuilder;
  const resolvedOptions = {
    ...options,
    environments: options?.environments ?? ['default'],
    handle: options.handle || OrmCoreSchemaHandle,
    defaultConfig: options.defaultConfig ?? DEFAULT_ORM_CONFIG,
  };
  const injector = Injector.create({
    providers: [
      // todo 目前好像用不到
      {
        provide: PI_ORM_CONFIG_TOKEN,
        useValue: resolvedOptions,
      },
      Builder,
      { provide: EnvironmentInjector, useFactory: () => injector },
    ],
    parent: options.injector,
  });
  options.registerOnDestroy?.(() => {
    injector.get(EnvironmentInjector).destroy();
  });
  const schemaObj = Object.entries(obj).reduce(
    (obj, [key, value]) => {
      const sh = new resolvedOptions.handle(
        resolvedOptions,
        undefined,
        undefined,
        { lazyMap: new Map() },
      );
      convertSchema(value as any, sh);
      obj[key] = sh;
      return obj;
    },
    {} as Record<string, AnyCoreSchemaHandle>,
  );

  return injector.get(Builder).buildEntitys(schemaObj);
}
