/**
 * 插件 factory
 */
import { TargetType } from "../type";
export declare type OptionsType = {
    [injectName: string]: any;
};
export declare function injectBind(target: TargetType, funcName: string, options: OptionsType): void;
export declare function injectRemove(target: TargetType, injectName: string, funcName?: string): void;
