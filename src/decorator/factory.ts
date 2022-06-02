/**
 * 插件 factory
 */
import { TargetType } from "../type";
export type OptionsType = {
  [injectName: string]: any;
};
// 装饰器绑定属性
export function injectBind(
  target: TargetType,
  funcName: string,
  options: OptionsType
): void {
  if (!target.$inject) {
    target.$inject = {};
  }
  for (const injectName in options) {
    if (target.$inject[injectName]) {
      // 绑定函数，多装饰器绑定
      target.$inject[injectName][funcName] = options[injectName];
    } else {
      target.$inject[injectName] = {
        [funcName]: options[injectName],
      };
    }
  }
}
// 装饰器解除属性绑定
export function injectRemove(
  target: TargetType,
  injectName: string,
  funcName?: string
): void {
  if (!target.$inject) {
    target.$inject = {};
  }
  if (target.$inject[injectName]) {
    if (funcName) {
      delete target.$inject[injectName][funcName];
    } else {
      delete target.$inject[injectName];
    }
  }
}