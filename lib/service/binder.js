"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restfulBinder = exports.routeBinder = void 0;
/**
 * koa-router路由绑定器
 */
const injector_1 = require("./injector");
// 不可被遍历的属性
const InUsingProperty = [
    "constructor",
    "$inject",
    "db", // 数据库引用
];
// restful自动反射绑定
function routeBinder(router, serviceModules, config) {
    const controllers = {};
    for (let name in serviceModules) {
        const serviceModule = serviceModules[name];
        // 获取模块函数名
        const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => InUsingProperty.every((p) => f.toLowerCase() !== p));
        // 实例化模块
        const moduleObj = Reflect.construct(serviceModule, []);
        for (let subName of moduleFuncs) {
            const [method, controller] = (0, injector_1.servInjector)(moduleObj, subName, config);
            router[method](`/${name}/${subName}`, controller);
            controllers[`${name}_${subName}`] = controller;
        }
    }
    return controllers;
}
exports.routeBinder = routeBinder;
// 基础restful绑定
function restfulBinder(router, serviceModules) {
    const controllers = {};
    for (let name in serviceModules) {
        const serviceModule = serviceModules[name];
        // 获取模块函数名
        const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => f !== "constructor" && f !== "$restful");
        // 实例化模块
        const moduleObj = Reflect.construct(serviceModule, []);
        for (let subName of moduleFuncs) {
            const { url, method } = moduleObj.$restful[subName];
            const controller = async (ctx) => {
                if (method?.toLowerCase() === "get") {
                    const { params } = ctx;
                    const res = await moduleObj[subName](params || {}, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === "post") {
                    const data = ctx.request.body;
                    const res = await moduleObj[subName](data, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === "put") {
                    const data = ctx.request.body;
                    const res = await moduleObj[subName](data, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === "delete") {
                    const { params } = ctx;
                    const res = await moduleObj[subName](params || {}, ctx);
                    ctx.body = res;
                }
                else {
                    return await moduleObj[subName](ctx);
                }
            };
            if (method?.toLowerCase() === "get") {
                router.get(url, controller);
            }
            else if (method?.toLowerCase() === "post") {
                router.post(url, controller);
            }
            else if (method?.toLowerCase() === "put") {
                router.put(url, controller);
            }
            else if (method?.toLowerCase() === "delete") {
                router.delete(url, controller);
            }
            else {
                router[method](url, controller);
            }
            controllers[`${url}`] = controller;
        }
    }
    return controllers;
}
exports.restfulBinder = restfulBinder;
//# sourceMappingURL=binder.js.map