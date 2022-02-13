"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectorBuilder = exports.restfulBinder = exports.routeBinder = exports.servInjector = exports.injectRemove = exports.injectBind = exports.Post = exports.Get = exports.ormConnectionCreate = exports.connectionCreate = exports.defineTables = void 0;
// Table 定义模块
const sequelize_1 = require("sequelize");
// 数据库连接模块
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
class defineTables {
    tablesStructure;
    relation;
    sequelize;
    sqlite;
    sqlite3;
    constructor(tablesStructure, relation, sequelize, sqlite, sqlite3) {
        this.tablesStructure = tablesStructure;
        this.relation = relation;
        this.sequelize = sequelize;
        this.sqlite = sqlite;
        this.sqlite3 = sqlite3;
    }
    // 定义表
    declareTables(sequelize, cacheTabs, transition) {
        const _this = this;
        const commonOpt = {
            freezeTableName: true,
            timestamps: false
        };
        let tables = {};
        if (cacheTabs && cacheTabs.length > 0) {
            // 按需初始化表
            cacheTabs.forEach((tableName) => {
                const model = _this.tablesStructure[tableName]({ s: sequelize, o: commonOpt, t: tableName });
                if (transition) {
                    tables[tableName] = _this.useTransaction(model, transition);
                }
                else {
                    tables[tableName] = model;
                }
            });
        }
        else {
            Object.keys(_this.tablesStructure).forEach((tableName) => {
                const model = _this.tablesStructure[tableName]({ s: sequelize, o: commonOpt, t: tableName });
                if (transition) {
                    tables[tableName] = _this.useTransaction(model, transition);
                }
                else {
                    tables[tableName] = model;
                }
            });
        }
        _this.relation(tables);
        return tables;
    }
    // 使用事务
    useTransaction(model, transaction) {
        // 原始方法
        /**
            model.addHook
            model.addScope
            model.afterBulkCreate
            model.afterBulkDestroy
            model.afterBulkSync
            model.afterBulkUpdate
            model.afterCreate
            model.afterDestroy
            model.afterFind
            model.afterSave
            model.afterSync
            model.afterUpdate
            model.afterValidate
            model.aggregate
            model.associations
            model.beforeBulkCreate
            model.beforeBulkDestroy
            model.beforeBulkSync
            model.beforeBulkUpdate
            model.beforeCount
            model.beforeCreate
            model.beforeDestroy
            model.beforeFind
            model.beforeFindAfterExpandIncludeAll
            model.beforeFindAfterOptions
            model.beforeSave
            model.beforeSync
            model.beforeUpdate
            model.beforeValidate
            model.belongsTo
            model.belongsToMany
            model.build
            model.bulkBuild
            model.bulkCreate
            model.count
            model.create
            model.decrement
            model.describe
            model.destroy
            model.drop
            model.findAll
            model.findAndCountAll
            model.findByPk
            model.findCreateFind
            model.findOne
            model.findOrBuild
            model.findOrCreate
            model.getTableName
            model.hasHook
            model.hasHooks
            model.hasMany
            model.hasOne
            model.increment
            model.init
            model.max
            model.min
            model.options
            model.primaryKeyAttribute
            model.primaryKeyAttributes
            model.rawAttributes
            model.removeAttribute
            model.removeHook
            model.restore
            model.schema
            model.scope
            model.sequelize
            model.sum
            model.sync
            model.tableName
            model.truncate
            model.unscoped
            model.update
            model.upsert
         */
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
        };
        return new Proxy(model, {
            get(target, propertyKey, receiver) {
                if (rewrite[propertyKey]) {
                    return rewrite[propertyKey];
                }
                else {
                    return Reflect.get(target, propertyKey, receiver);
                }
            }
        });
    }
    // 装饰器
    Sqlite(option) {
        const _this = this;
        const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
            const func = async (...args) => {
                const autoClose = option?.autoClose ?? true; // 自动关闭，默认true
                const useTransaction = option?.useTransaction ?? false; // 是否使用事物，默认false
                let res;
                if (option?.useOrm) {
                    const sequelize = await (0, exports.ormConnectionCreate)(_this.sequelize)();
                    let transaction = null;
                    if (useTransaction) {
                        transaction = await sequelize.transaction();
                    }
                    const tables = _this.declareTables(sequelize, option.tables, transaction);
                    target.db = { sequelize, tables, transaction };
                    try {
                        res = await value.apply(target, args);
                        if (useTransaction) {
                            transaction.commit();
                        }
                    }
                    catch (err) {
                        transaction.rollback();
                        throw err;
                    }
                    // res = await (value as Function).apply(target, args);
                    if (autoClose && !useTransaction) {
                        await sequelize.close();
                    }
                }
                else {
                    const conn = await (0, exports.connectionCreate)(_this.sqlite, _this.sqlite3)();
                    target.db = conn;
                    res = await value.apply(target, args);
                    if (autoClose) {
                        await conn.close();
                    }
                }
                return res;
            };
            return { configurable, enumerable, value: func, writable };
        };
        return decoratorFunc;
    }
}
exports.defineTables = defineTables;
// 创建通用sqlite连接
const connectionCreate = (_sqlite, _sqlite3) => async () => {
    try {
        const db = await sqlite.open({
            // filename: /根目录/db.sqlite.js
            // db.sqlite.js:
            // ```
            //   module.exports = { path: require('path').resolve('src', 'hybridapi', 'dbfile', 'cost_estimate.db') }
            // ```
            filename: require(require('path').resolve('db.sqlite.js')).path,
            driver: sqlite3.Database
        });
        return db;
    }
    catch (err) {
        new Error('DB connect error!');
    }
};
exports.connectionCreate = connectionCreate;
// 创建orm通用连接
const ormConnectionCreate = (_Sequelize) => async () => {
    try {
        let sqliteConfig = [{
                dialect: 'sqlite',
                storage: require(require('path').resolve('db.sqlite.js')).path
            }];
        const commonConfig = loadConfig();
        if (commonConfig) {
            sqliteConfig = commonConfig;
        }
        const sequelize = new sequelize_1.Sequelize(...sqliteConfig);
        return sequelize;
    }
    catch (err) {
        new Error('DB connect error!');
    }
};
exports.ormConnectionCreate = ormConnectionCreate;
// 读取数据库配置文件
const loadConfig = () => {
    // parsed: /项目根目录/.env
    // .env: DB_DRIVER=sqlite
    const { parsed } = require('dotenv').config();
    if (parsed.DB_DRIVER === 'sqlite') {
        const sqliteConfig = require(require('path').resolve('db.sqlite.js'));
        return [{
                dialect: 'sqlite',
                storage: sqliteConfig.path
            }];
    }
    else if (parsed.DB_DRIVER === 'mysql') {
        const mysqlConfig = require(require('path').resolve('db.mysql.js'));
        return [mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {
                host: mysqlConfig.host,
                port: mysqlConfig.port,
                dialect: 'mysql',
            }];
    }
    else if (parsed.DB_DRIVER === 'postgre') {
        return null;
    }
    else {
        return null;
    }
};
/**
 *  restful请求装饰器
 */
const Get = (url) => {
    const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
        const func = async (...args) => {
            const res = await value.apply(target, args);
            return res;
        };
        if (target.$restful) {
            target.$restful[propertyKey] = {
                url,
                method: 'get'
            };
        }
        else {
            target.$restful = {
                [propertyKey]: {
                    url,
                    method: 'get'
                }
            };
        }
        return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
};
exports.Get = Get;
const Post = (url) => {
    const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
        const func = async (...args) => {
            const res = await value.apply(target, args);
            return res;
        };
        if (target.$restful) {
            target.$restful[propertyKey] = {
                url,
                method: 'post'
            };
        }
        else {
            target.$restful = {
                [propertyKey]: {
                    url,
                    method: 'post'
                }
            };
        }
        return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
};
exports.Post = Post;
/**
 * 插件 factory
 */
// 装饰器绑定属性
const injectBind = (classObj, funcName, options) => {
    if (!classObj.$inject) {
        classObj.$inject = {};
    }
    for (const injectName in options) {
        if (classObj.$inject[injectName]) {
            // 绑定函数，多装饰器绑定
            classObj.$inject[injectName][funcName] = options[injectName];
        }
        else {
            classObj.$inject[injectName] = {
                [funcName]: options[injectName]
            };
        }
    }
};
exports.injectBind = injectBind;
// 装饰器解除属性绑定
const injectRemove = (classObj, injectName, funcName) => {
    if (!classObj.$inject) {
        classObj.$inject = {};
    }
    if (classObj.$inject[injectName]) {
        if (funcName) {
            delete classObj.$inject[injectName][funcName];
        }
        else {
            delete classObj.$inject[injectName];
        }
    }
};
exports.injectRemove = injectRemove;
const servInjector = (target, funcName, config) => {
    // 默认post
    let method = 'post';
    // 插件中如果有get优先get请求
    for (const injectName in config) {
        // 插件有指定method
        if (config[injectName].method) {
            // 插件是绑定在当前的函数上
            if (target?.$inject && target?.$inject[injectName] && target?.$inject[injectName][funcName]) {
                // 指定插件的method
                method = config[injectName].method;
                break;
            }
        }
    }
    //
    const controller = async (ctx) => {
        const fullRes = {}; // 插件返回值
        let data = null;
        // 前拦截器
        for (const injectName in config) {
            // 只处理注解的对象
            if (!config[injectName].before)
                continue;
            const pluginFunction = config[injectName].before.plugin;
            if (target?.$inject && target?.$inject[injectName] && target?.$inject[injectName][funcName]) {
                const pluginRes = await pluginFunction(ctx, target?.$inject[injectName][funcName]?.option);
                fullRes[injectName] = pluginRes;
                // 替换第一个参数
                if (config[injectName].before.replaceProps) {
                    data = pluginRes;
                }
            }
            // if (config[injectName].replaceProps) {
            //     // 异步方法解析
            //     if (Object.prototype.toString.call(pluginFunction) === '[object AsyncFunction]') {
            //         data = await pluginFunction(ctx, target?.$inject[injectName][funcName])
            //     } else {
            //         // 同步方法解析
            //         data = pluginFunction(ctx, target?.$inject[injectName][funcName])
            //     }
            // } else {
            //     if (Object.prototype.toString.call(pluginFunction) === '[object AsyncFunction]') {
            //         await pluginFunction(ctx, target?.$inject[injectName][funcName])
            //     } else {
            //         pluginFunction(ctx, target?.$inject[injectName][funcName])
            //     }
            // }
        }
        fullRes.data = ctx.request.body;
        if (data === null) {
            data = fullRes.data;
        }
        // 逻辑处理
        let res = await target[funcName](data, fullRes, ctx);
        // 后拦截器
        let hasAfterInjector = false;
        for (const injectName in config) {
            // 只处理注解的对象
            if (!config[injectName].after)
                continue;
            const pluginFunction = config[injectName].after.plugin;
            if (target?.$inject && target?.$inject[injectName] && target?.$inject[injectName][funcName]) {
                const pluginRes = await pluginFunction(res, ctx, target?.$inject[injectName][funcName]?.option);
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
exports.servInjector = servInjector;
// 路由绑定方法
const routeBinder = (router, serviceModules, config) => {
    const controllers = {};
    for (let name in serviceModules) {
        const serviceModule = serviceModules[name];
        // 获取模块函数名
        const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => f !== 'constructor' && f !== '$inject');
        // const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => f !== 'constructor');
        // 实例化模块
        const moduleObj = Reflect.construct(serviceModule, []);
        for (let subName of moduleFuncs) {
            // const controller = async (ctx: any) => {
            //     const data = ctx.request.body;
            //     const res = await moduleObj[subName](data, ctx);
            //     ctx.body = res;
            // }
            const [method, controller] = (0, exports.servInjector)(moduleObj, subName, config);
            router[method](`/${name}/${subName}`, controller);
            // console.log(`/${name}/${subName}`)
            controllers[`${name}_${subName}`] = controller;
        }
    }
    return controllers;
};
exports.routeBinder = routeBinder;
// restful 绑定方法
const restfulBinder = (router, serviceModules) => {
    const controllers = {};
    for (let name in serviceModules) {
        const serviceModule = serviceModules[name];
        // 获取模块函数名
        const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => f !== 'constructor' && f !== '$restful');
        // 实例化模块
        const moduleObj = Reflect.construct(serviceModule, []);
        for (let subName of moduleFuncs) {
            const { url, method } = moduleObj.$restful[subName];
            const controller = async (ctx) => {
                if (method?.toLowerCase() === 'get') {
                    const { params } = ctx;
                    const res = await moduleObj[subName](params || {}, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === 'post') {
                    const data = ctx.request.body;
                    const res = await moduleObj[subName](data, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === 'put') {
                    const data = ctx.request.body;
                    const res = await moduleObj[subName](data, ctx);
                    ctx.body = res;
                }
                else if (method?.toLowerCase() === 'delete') {
                    const { params } = ctx;
                    const res = await moduleObj[subName](params || {}, ctx);
                    ctx.body = res;
                }
                else {
                    return await moduleObj[subName](ctx);
                }
            };
            if (method?.toLowerCase() === 'get') {
                router.get(url, controller);
            }
            else if (method?.toLowerCase() === 'post') {
                router.post(url, controller);
            }
            else if (method?.toLowerCase() === 'put') {
                router.put(url, controller);
            }
            else if (method?.toLowerCase() === 'delete') {
                router.delete(url, controller);
            }
            else {
                router[method](url, controller);
            }
            // console.log(`/${name}/${subName}`)
            controllers[`${url}`] = controller;
        }
    }
    return controllers;
};
exports.restfulBinder = restfulBinder;
const injectorBuilder = (injectName, callbacks) => {
    const onCreate = callbacks?.onCreate || (() => ""); // 装饰器声明时
    const onBefore = callbacks?.onBefore || ((...args) => args); // 函数调用前
    const onAfter = callbacks?.onAfter || ((res) => res); // 函数调用后
    const Injector = (option) => {
        const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
            onCreate(target, propertyKey);
            const func = async (...args) => {
                const _args = await onBefore(...args);
                const _res = await value.apply(target, _args);
                const res = await onAfter(_res);
                return res;
            };
            (0, exports.injectBind)(target, propertyKey, {
                [injectName]: { option } // 对应 plugins/index.config 下的key名
            });
            return { configurable, enumerable, value: func, writable };
        };
        return decoratorFunc;
    };
    return Injector;
};
exports.injectorBuilder = injectorBuilder;
//# sourceMappingURL=resolver.js.map