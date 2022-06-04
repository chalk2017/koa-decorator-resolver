import { PluginConfig, ControllerType, KoaRouterType } from "../type";
export declare type Hooks = {
    onBeforeBind?: () => void | Promise<void>;
    onAfterBind?: () => void | Promise<void>;
};
export declare function routeBinder(router: KoaRouterType, serviceModules: {
    [className: string]: any;
}, config?: PluginConfig, hooks?: Hooks): {
    [controller: string]: ControllerType;
};
export declare function restfulBinder(router: KoaRouterType, serviceModules: {
    [className: string]: any;
}): {
    [controller: string]: ControllerType;
};
