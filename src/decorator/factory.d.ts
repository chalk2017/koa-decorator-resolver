/**
 * 插件 factory
 */
import { TargetType } from '../type';
export type OptionsType = {
  [injectName: string]: any
}
// 装饰器绑定属性
export function injectBind(target: TargetType, funcName: string, options: OptionsType): void;
// 装饰器解除属性绑定
export function injectRemove(target: TargetType, injectName: string, funcName?: string): void;
