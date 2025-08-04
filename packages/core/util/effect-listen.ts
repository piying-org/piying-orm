import {
  CreateEffectOptions,
  effect,
  EffectCleanupRegisterFn,
  EffectRef,
} from 'static-injector';
import { deepEqual } from 'fast-equals';
/** 跳过第一个值,假如发射时和初始值不同 */
export function effectListen(
  listen: () => any,
  fn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  let first = true;
  const oldValue = listen();
  return effect((onCleanup) => {
    const currentValue = listen();
    if (first) {
      first = false;
      if (!deepEqual(oldValue, currentValue)) {
        fn(onCleanup);
      }
      return;
    }
    return fn(onCleanup);
  }, options);
}
