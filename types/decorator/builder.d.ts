/**
 * 装饰器 builder
 */
import { TargetType, OptionType } from '../type';
// 装饰器类型声明
export type Injector<T> = (option?: T) => any;
// 函数装饰器构造器
export function injectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (target: TargetType, funcName: string, option: OptionType) => any,
    onBefore: (...args: any[]) => any,
    onAfter: (res: any) => any
  }
): (
    option?: OptionType
  ) => (
      target: TargetType,
      propertyKey: string,
      props: PropertyDescriptor
    ) => PropertyDescriptor;
export const funcInjectorBuilder: typeof injectorBuilder;
// export function funcInjectorBuilder(...args: Parameters<typeof injectorBuilder>): ReturnType<typeof injectorBuilder>;

// 类装饰器构造器
export function classInjectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (target: TargetType, option: OptionType) => any;
  }
): (option?: OptionType) => (target: TargetType) => TargetType;

// 参数装饰器构造器（需要同上述两个组合使用）
export function propsInjectorBuilder(
  injectName: string,
  callbacks?: {
    onDecorate: (target: TargetType, funcName: string, paramsIndex: number, option: OptionType) => any
  }
): (option?: OptionType) => (target: TargetType) => void;