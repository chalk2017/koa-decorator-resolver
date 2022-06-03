"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.Get = void 0;
function Get(url) {
    const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
        const func = async (...args) => {
            const res = await value.apply(target, args);
            return res;
        };
        if (target.$restful) {
            target.$restful[propertyKey] = {
                url,
                method: "get",
            };
        }
        else {
            target.$restful = {
                [propertyKey]: {
                    url,
                    method: "get",
                },
            };
        }
        return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
}
exports.Get = Get;
function Post(url) {
    const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
        const func = async (...args) => {
            const res = await value.apply(target, args);
            return res;
        };
        if (target.$restful) {
            target.$restful[propertyKey] = {
                url,
                method: "post",
            };
        }
        else {
            target.$restful = {
                [propertyKey]: {
                    url,
                    method: "post",
                },
            };
        }
        return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
}
exports.Post = Post;
//# sourceMappingURL=restful.js.map