"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTransfor = exports.useTransaction = exports.injectTransaction = exports.OrmLoader = exports.DefaultOptions = exports.OrmSequelize = void 0;
const sequelize_1 = require("sequelize");
const configurator_1 = require("../database/configurator");
// 用于Service模块db对象注入的继承类
class OrmSequelize {
    db;
}
exports.OrmSequelize = OrmSequelize;
// 参数默认值
exports.DefaultOptions = {
    useBaseConfig: true,
    useTransaction: false,
    useAlwaysConnection: false,
};
class OrmLoader {
    // db实例
    db = {
        sequelize: undefined,
        transaction: undefined,
        tables: undefined,
    };
    // 全局选项，外层注入
    options;
    // 创建连接
    async connect(...args) {
        const useBaseConfig = this.options.useBaseConfig ?? exports.DefaultOptions.useBaseConfig;
        try {
            const options = (0, configurator_1.loadConfig)({
                env: useBaseConfig ? true : false,
                transfor: useBaseConfig ? exports.baseTransfor : configurator_1.standardTransfor,
            }) || [];
            if (args && args.length > 0) {
                this.db.sequelize = new sequelize_1.Sequelize(...args);
            }
            else {
                this.db.sequelize = new sequelize_1.Sequelize(...options);
            }
        }
        catch (err) {
            new Error("DB connect error!");
        }
    }
    // 装饰方法调用前触发
    async onCallBefore(target, funcName, options) {
        // 使用长连接
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        if (!useAlwaysConnection) {
            this.connect();
        }
        // 使用事物
        const useTransaction = options?.useTransaction ?? exports.DefaultOptions.useTransaction;
        if (useTransaction) {
            this.db.transaction = await this.db.sequelize.transaction();
        }
        this.db.tables = this.declareTables(this.db.sequelize, this.db.transaction, options.tables, options.relation);
        target.db = this.db;
    }
    // 装饰方法调用后触发
    async onCallAfter(target, funcName, options) {
        // 使用长连接
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        // 使用事物
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await this.db.transaction.commit();
        }
        if (!useAlwaysConnection) {
            try {
                await this.db.sequelize.close();
            }
            catch (e) { }
        }
    }
    // 装饰方法调用报错时触发
    async onCallError(target, funcName, options, error) {
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await this.db.transaction.rollback();
        }
        if (!useAlwaysConnection) {
            try {
                await this.db.sequelize.close();
            }
            catch (e) { }
        }
    }
    // 定义表
    declareTables(sequelize, transition, cacheTabs, relation) {
        const modelOptions = {
            freezeTableName: true,
            timestamps: false,
        };
        // 简化模型定义
        const defineModel = (tableName) => (model, option) => sequelize.define(tableName, model, {
            ...modelOptions,
            ...(option || {}),
        });
        // 表模块构建
        const defineTablesModel = (tableName) => {
            let model = null;
            let res = this.options.tablesStructure[tableName](defineModel(tableName), {
                s: sequelize,
                t: tableName,
                o: modelOptions,
            });
            // 如果返回值是数组，则返回值代表参数
            if (res instanceof Array) {
                model = defineModel(tableName)(res[0], res[1]);
            }
            else {
                model = res;
            }
            return model;
        };
        // 表模型集
        let tables = {};
        if (cacheTabs && cacheTabs.length > 0) {
            // 按需初始化表
            cacheTabs.forEach((tableName) => {
                let model = defineTablesModel(tableName);
                if (transition) {
                    tables[tableName] = useTransaction(model, transition);
                }
                else {
                    tables[tableName] = model;
                }
            });
            if (relation) {
                relation(tables);
            }
        }
        else {
            // 全表实例化
            for (const tableName in this.options.tablesStructure) {
                let model = defineTablesModel(tableName);
                if (transition) {
                    tables[tableName] = useTransaction(model, transition);
                }
                else {
                    tables[tableName] = model;
                }
            }
            // 表关联回调（仅全表实例化时才可用）
            if (this.options?.relation) {
                this.options.relation(tables);
            }
        }
        return tables;
    }
}
exports.OrmLoader = OrmLoader;
function injectTransaction(model, transaction) {
    const rewrite = {
        // 重写方法
        create: async (v, o) => await model.create(v, { transaction, ...o }),
        update: async (v, o) => await model.update(v, { transaction, ...o }),
        destroy: async (o) => await model.destroy({ transaction, ...o }),
        bulkCreate: async (vs, o) => await model.bulkCreate(vs, { transaction, ...o }),
        findAll: async (o) => await model.findAll({ transaction, ...o }),
        findOne: async (o) => await model.findOne({ transaction, ...o }),
        max: async (f, o) => await model.max(f, { transaction, ...o }),
        min: async (f, o) => await model.min(f, { transaction, ...o }),
        sum: async (f, o) => await model.sum(f, { transaction, ...o }),
        count: async (o) => await model.count({ transaction, ...o }),
    };
    return rewrite;
}
exports.injectTransaction = injectTransaction;
// 使用事务
function useTransaction(model, transaction) {
    const rewrite = injectTransaction(model, transaction);
    return new Proxy(model, {
        get(target, propertyKey, receiver) {
            if (rewrite[propertyKey]) {
                return rewrite[propertyKey];
            }
            else {
                return Reflect.get(target, propertyKey, receiver);
            }
        },
    });
}
exports.useTransaction = useTransaction;
;
// 简化配置
/** @deprecated use baseTransfor */
const baseTransfor = (configDetail, env) => {
    const driver = env.DB_DRIVER;
    if (driver === "sqlite") {
        return [
            {
                dialect: "sqlite",
                storage: configDetail.path,
            },
        ];
    }
    else if (driver === "mysql") {
        return [
            configDetail.database,
            configDetail.username,
            configDetail.password,
            {
                host: configDetail.host,
                port: configDetail.port,
                dialect: "mysql",
            },
        ];
    }
    else if (driver === "postgres") {
        return [
            configDetail.database,
            configDetail.username,
            configDetail.password,
            {
                host: configDetail.host,
                port: configDetail.port,
                dialect: "postgres",
            },
        ];
    }
    else {
        return [];
    }
};
exports.baseTransfor = baseTransfor;
//# sourceMappingURL=sequelize.loader.js.map