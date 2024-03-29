/**
 * 通用类型定义
 */
export declare type MethodType = "get" | "post" | "put" | "delete";
export declare type BeforeInjectReturnType = any;
export declare type InterceptReturnType = any;
export declare type ModuleFuncReturnType = any;
export declare type AfterInjectReturnType = any;
export declare type RequestBodyType = any;
export declare type ResponseBodyType = any;
export declare type KoaRouterType = any;
export declare type TargetType = any;
export declare type CtxType = any;
export declare type OptionType = {
    [prop: string]: string;
};
export declare type ControllerType = (ctx: CtxType) => Promise<void>;
export declare type UrlType = string;
export declare type ModuleFuncArgsType = [
    RequestBodyType | BeforeInjectReturnType,
    {
        data: RequestBodyType;
        [injectName: string]: BeforeInjectReturnType;
    },
    CtxType
];
/** @deprecated use ServiceFunctionArgs */
export declare type ServiceFunctionArgs = ModuleFuncArgsType;
export declare type ModuleFuncType = (...args: ModuleFuncArgsType) => Promise<ModuleFuncReturnType>;
export declare type Injector<T> = (option?: T) => any;
export declare type PluginConfig = {
    [injectorName: string]: {
        method?: MethodType;
        before?: {
            plugin: (ctx: CtxType, option?: OptionType) => Promise<BeforeInjectReturnType> | BeforeInjectReturnType;
            replaceProps: boolean;
        };
        after?: {
            plugin: (res: InterceptReturnType | ModuleFuncReturnType, ctx: CtxType, option?: OptionType) => Promise<AfterInjectReturnType> | AfterInjectReturnType;
            replaceProps: boolean;
        };
        intercept?: (func: ModuleFuncType, args: ModuleFuncArgsType, option?: OptionType) => Promise<InterceptReturnType> | InterceptReturnType;
    };
};
