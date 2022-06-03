"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectRemove = exports.injectBind = void 0;
// 装饰器绑定属性
function injectBind(target, funcName, options) {
    if (!target.$inject) {
        target.$inject = {};
    }
    for (const injectName in options) {
        if (target.$inject[injectName]) {
            // 绑定函数，多装饰器绑定
            target.$inject[injectName][funcName] = options[injectName];
        }
        else {
            target.$inject[injectName] = {
                [funcName]: options[injectName],
            };
        }
    }
}
exports.injectBind = injectBind;
// 装饰器解除属性绑定
function injectRemove(target, injectName, funcName) {
    if (!target.$inject) {
        target.$inject = {};
    }
    if (target.$inject[injectName]) {
        if (funcName) {
            delete target.$inject[injectName][funcName];
        }
        else {
            delete target.$inject[injectName];
        }
    }
}
exports.injectRemove = injectRemove;
//# sourceMappingURL=factory.js.map