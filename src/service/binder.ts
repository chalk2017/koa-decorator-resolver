/**
 * koa-router路由绑定器
 */
import { servInjector } from "./injector";
import { PluginConfig, ControllerType, KoaRouterType } from "../type";
export type Hooks = {
  onBeforeBind?: () => void | Promise<void>; // 绑定前
  onAfterBind?: () => void | Promise<void>; // 绑定前
};
// 不可被遍历的属性
const InUsingProperty = [
  "constructor", // 构造函数
  "$inject", // 装饰器注入
  "db", // 数据库引用
];
// restful自动反射绑定
export function routeBinder(
  router: KoaRouterType,
  serviceModules: { [className: string]: any },
  config?: PluginConfig,
  hooks?: Hooks
): { [controller: string]: ControllerType } {
  // 钩子函数
  const onBeforeBind = hooks?.onBeforeBind || (async () => null);
  const onAfterBind = hooks?.onAfterBind || (async () => null);
  const onAsync = async (hook: any) => await hook();
  // 控制器池
  const controllers = {};
  // 绑定前钩子
  onAsync(onBeforeBind)
    .then(() => undefined)
    .catch((err) => console.error(err));
  for (let name in serviceModules) {
    const serviceModule = serviceModules[name];
    // 获取模块函数名
    const moduleFuncs = Object.getOwnPropertyNames(
      serviceModule.prototype
    ).filter((f) => InUsingProperty.every((p) => f.toLowerCase() !== p));
    // 实例化模块
    const moduleInstance = Reflect.construct(serviceModule, []);
    for (let subName of moduleFuncs) {
      const [method, controller, url] = servInjector(
        moduleInstance,
        subName,
        config || {}
      );
      if (url) {
        router[method](url, controller);
      } else {
        router[method](`/${name}/${subName}`, controller);
      }
      controllers[`${name}_${subName}`] = controller;
    }
  }
  // 绑定后钩子
  onAsync(onAfterBind)
    .then(() => undefined)
    .catch((err) => console.error(err));
  return controllers;
}

// 基础restful绑定
export function restfulBinder(
  router: KoaRouterType,
  serviceModules: { [className: string]: any }
): { [controller: string]: ControllerType } {
  const controllers = {};
  for (let name in serviceModules) {
    const serviceModule = serviceModules[name];
    // 获取模块函数名
    const moduleFuncs = Object.getOwnPropertyNames(
      serviceModule.prototype
    ).filter((f) => f !== "constructor" && f !== "$restful");
    // 实例化模块
    const moduleObj = Reflect.construct(serviceModule, []);
    for (let subName of moduleFuncs) {
      const { url, method } = moduleObj.$restful[subName];
      const controller = async (ctx) => {
        if (method?.toLowerCase() === "get") {
          const { params } = ctx;
          const res = await moduleObj[subName](params || {}, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "post") {
          const data = ctx.request.body;
          const res = await moduleObj[subName](data, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "put") {
          const data = ctx.request.body;
          const res = await moduleObj[subName](data, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "delete") {
          const { params } = ctx;
          const res = await moduleObj[subName](params || {}, ctx);
          ctx.body = res;
        } else {
          return await moduleObj[subName](ctx);
        }
      };
      if (method?.toLowerCase() === "get") {
        router.get(url, controller);
      } else if (method?.toLowerCase() === "post") {
        router.post(url, controller);
      } else if (method?.toLowerCase() === "put") {
        router.put(url, controller);
      } else if (method?.toLowerCase() === "delete") {
        router.delete(url, controller);
      } else {
        router[method](url, controller);
      }
      controllers[`${url}`] = controller;
    }
  }
  return controllers;
}
