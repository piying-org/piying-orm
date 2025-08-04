import { InjectionToken } from 'static-injector';
import { DefaultOrmConfig } from './type';
// todo 待配置
/** 一些默认配置 */
export const PI_ORM_CONFIG_TOKEN = new InjectionToken<{
  defaultConfig?: DefaultOrmConfig;
}>('Pi_ORM_CONFIG');
