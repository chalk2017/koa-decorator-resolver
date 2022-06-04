"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propsInjectorBuilder = exports.classInjectorBuilder = exports.funcInjectorBuilder = exports.injectorBuilder = void 0;
const factory_1 = require("./factory");
// 装饰器类型声明
function injectorBuilder(injectName, callbacks) {
    const onDecorate = callbacks?.onDecorate || (() => ""); // 装饰器声明时
    const onBefore = callbacks?.onBefore || ((...args) => args); // 函数调用前
    const onAfter = callbacks?.onAfter || ((res) => res); // 函数调用后
    return (option) => {
        return (target, propertyKey, { configurable, enumerable, value, writable }) => {
            onDecorate(target, propertyKey, option);
            const func = async (...args) => {
                const _args = await onBefore(...args);
                const _res = await value.apply(target, _args);
                const res = await onAfter(_res);
                return res;
            };
            (0, factory_1.injectBind)(target, propertyKey, {
                [injectName]: { option }, // target['$inject'][injectName][propertyKey] -> { option }
            });
            return { configurable, enumerable, value: func, writable };
        };
        // return decoratorFunc;
    };
    // return Injector;
}
exports.injectorBuilder = injectorBuilder;
/** @deprecated use funcInjectorBuilder */
exports.funcInjectorBuilder = injectorBuilder;
// 类装饰器构造器
function classInjectorBuilder(injectName, callbacks) {
    const onDecorate = callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
    // 定义装饰器工厂
    const Injector = (option) => {
        const decoratorFunc = (target) => {
            onDecorate(target, option);
            (0, factory_1.injectBind)(target, "$class", {
                [injectName]: { option }, // target['$inject']['$class'][injectName] -> { option }
            });
            return target;
        };
        return decoratorFunc;
    };
    return Injector;
}
exports.classInjectorBuilder = classInjectorBuilder;
// 参数装饰器构造器（需要同上述两个组合使用）
function propsInjectorBuilder(injectName, callbacks) {
    const onDecorate = callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
    // 定义装饰器工厂
    const Injector = (option) => {
        const decoratorFunc = (target, funcName, paramsIndex) => {
            onDecorate(target, funcName, paramsIndex, option);
            (0, factory_1.injectBind)(target, "$props", {
                [injectName]: {
                    funcName,
                    option,
                }, // target['$inject']['$props'][injectName] -> { funcName, option }
            });
        };
        return decoratorFunc;
    };
    return Injector;
}
exports.propsInjectorBuilder = propsInjectorBuilder;
//# sourceMappingURL=builder.js.map