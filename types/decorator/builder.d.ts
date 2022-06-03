/**
 * 装饰器 builder
 */
import { TargetType, OptionType } from "../type";
export declare function injectorBuilder(injectName: string, callbacks?: {
    onDecorate: (target: TargetType, funcName: string, option: OptionType) => any;
    onBefore: (...args: any[]) => any;
    onAfter: (res: any) => any;
}): (option?: OptionType) => (target: TargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
/** @deprecated use funcInjectorBuilder */
export declare const funcInjectorBuilder: typeof injectorBuilder;
export declare function classInjectorBuilder(injectName: string, callbacks?: {
    onDecorate: (target: TargetType, option: OptionType) => any;
}): (option?: OptionType) => (target: TargetType) => TargetType;
export declare function propsInjectorBuilder(injectName: string, callbacks?: {
    onDecorate: (target: TargetType, funcName: string, paramsIndex: number, option: OptionType) => any;
}): (option?: OptionType) => (target: TargetType, funcName: string, paramsIndex: number) => void;
