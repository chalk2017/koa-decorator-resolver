/**
 * 装饰器 builder
 */
import { TargetType, OptionType } from "../type";
import { injectBind } from "./factory";
// 装饰器类型声明
export function injectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (
      target: TargetType,
      funcName: string,
      option: OptionType
    ) => any;
    onBefore: (...args: any[]) => any;
    onAfter: (res: any) => any;
  }
): (
  option?: OptionType
) => (
  target: TargetType,
  propertyKey: string,
  props: PropertyDescriptor
) => PropertyDescriptor {
  const onDecorate = callbacks?.onDecorate || (() => ""); // 装饰器声明时
  const onBefore = callbacks?.onBefore || ((...args) => args); // 函数调用前
  const onAfter = callbacks?.onAfter || ((res) => res); // 函数调用后
  return (option) => {
    return (
      target,
      propertyKey,
      { configurable, enumerable, value, writable }
    ) => {
      onDecorate(target, propertyKey, option);
      const func = async (...args) => {
        const _args = await onBefore(...args);
        const _res = await value.apply(target, _args);
        const res = await onAfter(_res);
        return res;
      };
      injectBind(target, propertyKey, {
        [injectName]: { option }, // target['$inject'][injectName][propertyKey] -> { option }
      });
      return { configurable, enumerable, value: func, writable };
    };
    // return decoratorFunc;
  };
  // return Injector;
}
/** @deprecated use funcInjectorBuilder */
export const funcInjectorBuilder = injectorBuilder;

// 类装饰器构造器
export function classInjectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (target: TargetType, option: OptionType) => any;
  }
): (option?: OptionType) => (target: TargetType) => TargetType {
  const onDecorate = callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
  // 定义装饰器工厂
  const Injector = (option) => {
    const decoratorFunc = (target) => {
      onDecorate(target, option);
      injectBind(target, "$class", {
        [injectName]: { option }, // target['$inject']['$class'][injectName] -> { option }
      });
      return target;
    };
    return decoratorFunc;
  };
  return Injector;
}

// 参数装饰器构造器（需要同上述两个组合使用）
export function propsInjectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (
      target: TargetType,
      funcName: string,
      paramsIndex: number,
      option: OptionType
    ) => any;
  }
): (
  option?: OptionType
) => (target: TargetType, funcName: string, paramsIndex: number) => void {
  const onDecorate = callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
  // 定义装饰器工厂
  const Injector = (option) => {
    const decoratorFunc = (target, funcName, paramsIndex) => {
      onDecorate(target, funcName, paramsIndex, option);
      injectBind(target, "$props", {
        [injectName]: {
          funcName,
          option,
        }, // target['$inject']['$props'][injectName] -> { funcName, option }
      });
    };
    return decoratorFunc;
  };
  return Injector;
}
