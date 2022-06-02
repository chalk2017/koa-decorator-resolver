import {
    PluginConfig,
    MethodType,
    TargetType,
    ControllerType,
} from '../type';
// server 插件注入
export function servInjector(
    target: TargetType,
    funcName: string,
    config: PluginConfig
): [MethodType, ControllerType];
