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
    connectionKey: "global-connection",
};
class OrmLoader {
    // 连接池对象
    connectionPool = {};
    distroyConnect(key) {
        if (this.options?.useAlwaysConnection ??
            exports.DefaultOptions.useAlwaysConnection) {
            // nothing to do
        }
        else {
            delete this.connectionPool[key];
        }
    }
    // 全局选项，外层注入
    options;
    // 创建连接
    async connect(connectOptions) {
        const useBaseConfig = this.options.useBaseConfig ?? exports.DefaultOptions.useBaseConfig;
        const connectionKey = connectOptions?.key || exports.DefaultOptions.connectionKey;
        this.connectionPool[connectionKey] = {};
        try {
            const options = (0, configurator_1.loadConfig)({
                env: useBaseConfig ? true : false,
                transfor: useBaseConfig ? exports.baseTransfor : configurator_1.standardTransfor,
            }) || [];
            if (connectOptions?.args && connectOptions?.args.length > 0) {
                this.connectionPool[connectionKey].sequelize = new sequelize_1.Sequelize(...connectOptions?.args);
            }
            else {
                this.connectionPool[connectionKey].sequelize = new sequelize_1.Sequelize(...options);
            }
        }
        catch (err) {
            this.distroyConnect(connectionKey);
            new Error("DB connect error!");
        }
    }
    // 装饰方法调用前触发
    async onCallBefore(target, funcName, options) {
        const _this = this;
        // 初始化key
        let connectionKey = exports.DefaultOptions.connectionKey;
        // 初始化事务
        let transaction = null;
        // 使用长连接
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        if (!useAlwaysConnection) {
            connectionKey = Symbol(funcName);
            this.connect({ key: connectionKey });
        }
        try {
            // 使用事物
            let useTransaction = options?.useTransaction ?? exports.DefaultOptions.useTransaction;
            // 按需设置事务对象
            if (useTransaction) {
                transaction = await this.connectionPool[connectionKey].sequelize.transaction();
            }
            if (!useAlwaysConnection) {
                this.connectionPool[connectionKey].transaction = transaction;
            }
            else {
                this.connectionPool[connectionKey].transaction = null;
            }
            const tables = this.declareTables(this.connectionPool[connectionKey].sequelize, transaction, options.tables, options.relation);
            // target.db = this.db;
            target.db = new Proxy({}, {
                get(context, propertyKey, receiver) {
                    if (propertyKey === "sequelize") {
                        return _this.connectionPool[connectionKey].sequelize;
                    }
                    else if (propertyKey === "transaction") {
                        _this.connectionPool[connectionKey].transaction;
                    }
                    else if (propertyKey === "tables") {
                        return tables;
                    }
                    else {
                        return Reflect.get(context, propertyKey, receiver);
                    }
                },
            });
            // 返回key
            return { connectionKey, transaction };
        }
        catch (err) {
            this.distroyConnect(connectionKey);
            throw err;
        }
    }
    // 装饰方法调用后触发
    async onCallAfter(target, funcName, options, callBeforeResult) {
        const connectionKey = callBeforeResult.connectionKey;
        // 使用长连接
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        // 使用事物
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await callBeforeResult?.transaction?.commit();
        }
        if (!useAlwaysConnection) {
            try {
                await this.connectionPool[connectionKey].sequelize.close();
            }
            catch (e) { }
        }
        this.distroyConnect(connectionKey);
    }
    // 装饰方法调用报错时触发
    async onCallError(target, funcName, options, callBeforeResult, callAfterResult, error) {
        const useAlwaysConnection = this.options?.useAlwaysConnection ?? exports.DefaultOptions.useAlwaysConnection;
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await callBeforeResult?.transaction?.rollback();
        }
        if (!useAlwaysConnection) {
            try {
                if (callBeforeResult?.connectionKey) {
                    await this.connectionPool[callBeforeResult?.connectionKey].sequelize.close();
                }
            }
            catch (e) { }
        }
        this.distroyConnect(callBeforeResult?.connectionKey);
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
// 简化配置
/** @deprecated use baseTransfor */
const baseTransfor = (configDetail, env) => {
    const defaultPool = {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    };
    const driver = env.DB_DRIVER;
    if (driver === "sqlite") {
        return [
            {
                dialect: "sqlite",
                storage: configDetail.path,
                pool: configDetail.pool || defaultPool
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
                pool: configDetail.pool || defaultPool
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
                pool: configDetail.pool || defaultPool
            },
        ];
    }
    else {
        return [];
    }
};
exports.baseTransfor = baseTransfor;
//# sourceMappingURL=sequelize.loader.js.map