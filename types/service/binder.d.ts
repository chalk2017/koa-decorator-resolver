import { PluginConfig, ControllerType, KoaRouterType } from "../type";

// restful自动反射绑定
export function routeBinder(
    router: KoaRouterType,
    serviceModules: { [className: string]: any },
    config?: PluginConfig
): { [controller: string]: ControllerType };

// 基础restful绑定
export function restfulBinder(
    router: KoaRouterType,
    serviceModules: { [className: string]: any }
): { [controller: string]: ControllerType };
