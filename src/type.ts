/**
 * 通用类型定义
 */
// Method类型
export type MethodType = "get" | "post" | "put" | "delete";
//
export type BeforeInjectReturnType = any; // 插件before拦截器的返回值
export type InterceptReturnType = any; // 插件intercept拦截器的返回值
export type ModuleFuncReturnType = any; // 模块函数返回值
export type AfterInjectReturnType = any; // 插件after拦截器的返回值
export type RequestBodyType = any; // request请求body内容
export type ResponseBodyType = any; // response回执body内容
export type KoaRouterType = any; // koa路由实例
// 模块实例类型
export type TargetType = any;
// koa参数实例类型
export type CtxType = any;
// 装饰器Option类型
export type OptionType = { [prop: string]: string };
// 控制器类型
export type ControllerType = (ctx: CtxType) => Promise<void>;
// 模块函数参数类型定义
export type ModuleFuncArgsType = [
  RequestBodyType | BeforeInjectReturnType /*data*/,
  {
    data: RequestBodyType;
    [injectName: string]: BeforeInjectReturnType;
  } /*fullRes*/,
  CtxType /*ctx*/
];
/** @deprecated use ServiceFunctionArgs */
export type ServiceFunctionArgs = ModuleFuncArgsType;
// 模块函数类型定义
export type ModuleFuncType = (
  ...args: ModuleFuncArgsType
) => Promise<ModuleFuncReturnType>;
// 装饰器类型声明
export type Injector<T> = (option?: T) => any;
// 装饰器插件配置结构
export type PluginConfig = {
  [injectorName: string]: {
    method?: MethodType;
    before?: {
      plugin: (
        ctx: CtxType,
        option?: OptionType
      ) => Promise<BeforeInjectReturnType> | BeforeInjectReturnType;
      replaceProps: boolean;
    };
    after?: {
      plugin: (
        res: InterceptReturnType | ModuleFuncReturnType,
        ctx: CtxType,
        option?: OptionType
      ) => Promise<AfterInjectReturnType> | AfterInjectReturnType;
      replaceProps: boolean;
    };
    intercept?: (
      func: ModuleFuncType,
      args: ModuleFuncArgsType,
      option?: OptionType
    ) => Promise<InterceptReturnType> | InterceptReturnType;
  };
};
