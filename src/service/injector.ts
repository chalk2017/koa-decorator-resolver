// 自动注入
import {
  PluginConfig,
  MethodType,
  TargetType,
  ControllerType,
  UrlType,
} from "../type";
import { InjectorType } from "../decorator/factory";
/**
 * service方法参数：
 * arg1：页面传输参数
 * arg2：插件参数 + 页面传输参数
 * arg3：请求交互的ctx对象
 */
export function servInjector(
  target: TargetType,
  funcName: string,
  config: PluginConfig
): [MethodType, ControllerType, UrlType] {
  // 默认post
  let method: MethodType = "post";
  // 获取装饰器列表
  const injectors: Array<InjectorType> = Reflect.getMetadata(
    "inject::plugins",
    target,
    funcName
  ) || [];
  // 并入插件
  let pluginMethod: string | undefined = undefined;
  let pluginIntercept: { intercept: any; option: any } | undefined = undefined;
  const injectPlugins: Array<InjectorType & { plugin: PluginConfig[string] }> =
    injectors.map((item) => {
      const plugin = config[item.injectName];
      if (pluginMethod === undefined) {
        pluginMethod = plugin.method;
      }
      if (pluginIntercept === undefined && plugin.intercept) {
        pluginIntercept = {
          intercept: plugin.intercept,
          option: item.option,
        };
      }
      return {
        ...item,
        plugin,
      };
    });

  // 定义控制器
  const controller = async (ctx) => {
    const fullRes = {} as any; // 插件返回值
    let data = null; // 装饰的方法的第一个默认参数
    // 装饰器前拦截器
    for (const injector of injectPlugins) {
      if (!injector.plugin.before) continue;
      const pluginRes = await injector.plugin.before.plugin(
        ctx,
        injector.option
      );
      fullRes[injector.injectName] = pluginRes;
      // 替换第一个参数(如果多个装饰器replaceProps=true,data只取最后一个装饰器的返回值)
      if (injector.plugin.before.replaceProps) {
        data = pluginRes;
      }
    }

    fullRes.data = ctx.request.body;
    if (data === null) {
      data = fullRes.data;
    }
    // 中间拦截器
    let res = null;
    if (pluginIntercept) {
      res = await pluginIntercept.intercept(
        target[funcName],
        [data, fullRes, ctx],
        pluginIntercept.option
      );
    } else {
      res = await target[funcName](data, fullRes, ctx);
    }
    // 装饰器后拦截器
    let hasAfterInjector = false;
    for (const injector of injectPlugins) {
      if (!injector.plugin.after) continue;
      const pluginRes = await injector.plugin.after.plugin(
        ctx,
        injector.option
      );
      fullRes[injector.injectName] = pluginRes;
      hasAfterInjector = true; // 有后拦截器的情况
      if (injector.plugin.after.replaceProps) {
        // 如果有后拦截器，用后拦截器的结构填充body
        ctx.body = pluginRes;
      }
    }
    // 如果没有后拦截器，用body填充res
    if (!hasAfterInjector) {
      ctx.body = res;
    }
  };
  return [method, controller, null];
}
