// 自动注入
/**
 * service方法参数：
 * arg1：页面传输参数
 * arg2：插件参数 + 页面传输参数
 * arg3：请求交互的ctx对象
 */
export function servInjector (target, funcName, config) {
    // 默认post
    let method = "post";
    for (const injectName in config) {
        // 插件有指定method，优先第一个插件的请求
        if (config[injectName].method) {
            // 插件是绑定在当前的函数上
            if (
                target?.$inject &&
                target?.$inject[injectName] &&
                target?.$inject[injectName][funcName]
            ) {
                // 指定插件的method
                method = config[injectName].method;
                break;
            }
        }
    }
    // 获取插件中拦截器
    let intercept = null;
    let interceptOption = null;
    // 只截取第一个拦截器
    for (const injectName in config) {
        if (config[injectName].intercept) {
            // 插件是绑定在当前的函数上
            if (
                target?.$inject &&
                target?.$inject[injectName] &&
                target?.$inject[injectName][funcName]
            ) {
                intercept = config[injectName].intercept;
                interceptOption = target?.$inject[injectName][funcName]?.option;
                break;
            }
        }
    }
    // 定义控制器
    const controller = async (ctx) => {
        const fullRes = {}; // 插件返回值
        let data = null; // 装饰的方法的第一个默认参数
        // 装饰器前拦截器
        for (const injectName in config) {
            // 只处理注解的对象
            if (!config[injectName].before) continue;
            if (
                target?.$inject &&
                target?.$inject[injectName] &&
                target?.$inject[injectName][funcName]
            ) {
                const pluginFunction = config[injectName].before.plugin;
                const pluginRes = await pluginFunction(
                    ctx,
                    target?.$inject[injectName][funcName]?.option
                );
                fullRes[injectName] = pluginRes;
                // 替换第一个参数(如果多个装饰器replaceProps=true,data只取最后一个装饰器的返回值)
                if (config[injectName].before.replaceProps) {
                    data = pluginRes;
                }
            }
        }
        fullRes.data = ctx.request.body;
        if (data === null) {
            data = fullRes.data;
        }
        // 中间拦截器
        let res = null;
        if (intercept) {
            res = await intercept(
                target[funcName],
                [data, fullRes, ctx],
                interceptOption
            );
        } else {
            res = await target[funcName](data, fullRes, ctx);
        }
        // 装饰器后拦截器
        let hasAfterInjector = false;
        for (const injectName in config) {
            // 只处理注解的对象
            if (!config[injectName].after) continue;
            const pluginFunction = config[injectName].after.plugin;
            if (
                target?.$inject &&
                target?.$inject[injectName] &&
                target?.$inject[injectName][funcName]
            ) {
                const pluginRes = await pluginFunction(
                    res,
                    ctx,
                    target?.$inject[injectName][funcName]?.option
                );
                fullRes[injectName] = pluginRes;
                hasAfterInjector = true; // 有后拦截器的情况
                // 替换第一个参数
                if (config[injectName].after.replaceProps) {
                    // 如果有后拦截器，用后拦截器的结构填充body
                    ctx.body = pluginRes;
                }
            }
        }
        // 如果没有后拦截器，用body填充res
        if (!hasAfterInjector) {
            ctx.body = res;
        }
    };
    return [method, controller];
};