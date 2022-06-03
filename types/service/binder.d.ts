import { PluginConfig, ControllerType, KoaRouterType } from "../type";
export declare function routeBinder(router: KoaRouterType, serviceModules: {
    [className: string]: any;
}, config?: PluginConfig): {
    [controller: string]: ControllerType;
};
export declare function restfulBinder(router: KoaRouterType, serviceModules: {
    [className: string]: any;
}): {
    [controller: string]: ControllerType;
};
