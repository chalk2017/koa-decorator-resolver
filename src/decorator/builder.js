// 装饰器类型声明
export function injectorBuilder(injectName, callbacks) {
    const onDecorate = callbacks?.onDecorate || (() => ""); // 装饰器声明时
    const onBefore = callbacks?.onBefore || ((...args) => args); // 函数调用前
    const onAfter = callbacks?.onAfter || ((res) => res); // 函数调用后
    const Injector = (option) => {
        const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
            onDecorate(target, propertyKey, option);
            const func = async (...args) => {
                const _args = await onBefore(...args);
                const _res = await (value).apply(target, _args);
                const res = await onAfter(_res);
                return res;
            };
            injectBind(target, propertyKey, {
                [injectName]: { option }, // target['$inject'][injectName][propertyKey] -> { option }
            });
            return { configurable, enumerable, value: func, writable };
        };
        return decoratorFunc;
    };
    return Injector;
};
/** @deprecated use funcInjectorBuilder */
export const funcInjectorBuilder = injectorBuilder;

// 类装饰器
export const classInjectorBuilder = (injectName, callbacks) => {
    const onDecorate =
        callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
    // 定义装饰器工厂
    const Injector = (option) => {
        const decoratorFunc = (target) => {
            onDecorate(target, option);
            injectBind(target, "$class", {
                [injectName]: { option }, // target['$inject']['$class'][injectName] -> { option }
            });
            return target;
        };
        return decoratorFunc;
    };
    return Injector;
};

// 参数装饰器
export const propsInjectorBuilder = (injectName, callbacks) => {
    const onDecorate =
        callbacks?.onDecorate || ((...args) => args); // 装饰器声明时
    // 定义装饰器工厂
    const Injector = (option) => {
        const decoratorFunc = (target, funcName, paramsIndex) => {
            onDecorate(target, funcName, paramsIndex, option);
            injectBind(target, "$props", {
                [injectName]: {
                    funcName,
                    option
                }, // target['$inject']['$props'][injectName] -> { funcName, option }
            });
        };
        return decoratorFunc;
    };
    return Injector;
};
