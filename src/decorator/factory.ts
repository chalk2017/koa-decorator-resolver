/**
 * 插件 factory
 */
import { TargetType } from "../type";
import * as Reflect from "reflect-metadata";
export type OptionsType = {
  [injectName: string]: any;
};
export type InjectorType = {
  injectName: string;
  option: any;
};
// 装饰器绑定属性
export function injectBind(
  target: TargetType,
  funcName: string,
  options: OptionsType
): void {
  let injectors: Array<InjectorType> = Reflect.getMetadata(
    "inject::plugins",
    target,
    funcName
  );
  for (const injectName in options) {
    if (injectors && injectors instanceof Array) {
      const injector = injectors.filter((item) => {
        return item.injectName === injectName;
      });
      if (injector.length > 0) {
        injector[0].option = options[injectName];
      } else {
        injectors.push({
          injectName,
          option: options[injectName],
        });
      }
    } else {
      injectors = [{ injectName, option: options[injectName] }];
    }
    Reflect.defineMetadata("inject::plugins", injectors, target, funcName);
  }
}
// 装饰器解除属性绑定
export function injectRemove(
  target: TargetType,
  injectName: string,
  funcName: string
): void {
  const injectors: Array<InjectorType> = Reflect.getMetadata(
    "inject::plugins",
    target,
    funcName
  );
  Reflect.defineMetadata(
    "inject::plugins",
    injectors.filter((item) => {
      item.injectName !== injectName;
    }),
    target,
    funcName
  );
}
