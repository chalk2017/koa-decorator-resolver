"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefineDatabase = void 0;
class DefineDatabase {
    // ORM
    orm = {
        onCallBefore: async () => "",
        onCallAfter: async () => "",
        onCallError: async () => "",
        connect: async () => "",
    };
    // 全局参数
    options = {};
    // 初始化
    constructor(ormLoader, options) {
        // 加载参数
        this.options = options || {};
        // 加载orm
        this.orm = new ormLoader(options);
        // 绑定option参数，不允许修改orm.option但可以修改orm.option下的成员
        Object.defineProperty(this.orm, "options", {
            get() {
                return this.options;
            },
        });
    }
    // 数据库连接
    async connect(...args) {
        await this.orm?.connect(...args);
    }
    // 装饰器
    database(options) {
        const _this = this;
        const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
            const func = async (...args) => {
                let res = undefined;
                try {
                    await _this.orm.onCallBefore.call(_this.orm, target, propertyKey, options);
                    res = await value.apply(target, args);
                    await _this.orm.onCallAfter.call(_this.orm, target, propertyKey, options);
                }
                catch (err) {
                    await _this.orm.onCallError.call(_this.orm, target, propertyKey, options, err);
                    throw err;
                }
                return res;
            };
            return { configurable, enumerable, value: func, writable };
        };
        return decoratorFunc;
    }
}
exports.DefineDatabase = DefineDatabase;
//# sourceMappingURL=baseDefined.js.map