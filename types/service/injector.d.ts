import { PluginConfig, MethodType, TargetType, ControllerType } from "../type";
/**
 * service方法参数：
 * arg1：页面传输参数
 * arg2：插件参数 + 页面传输参数
 * arg3：请求交互的ctx对象
 */
export declare function servInjector(target: TargetType, funcName: string, config: PluginConfig): [MethodType, ControllerType];
