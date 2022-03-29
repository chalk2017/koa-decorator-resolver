import { PluginConfig, FullResType, Option, TablesStructure, DefineTables } from "./resolver.d";
// Table 定义模块
import { Sequelize, ModelCtor, Model, Transaction } from "sequelize";
// 数据库连接模块
import {
  Database as Sqlite3Database,
  Statement as Sqlite3Statement,
} from "sqlite3";
import { Database as SqliteDatabase } from "sqlite";
// // type Sequelize = any;
// // type ModelCtor<T> = any;
// // type Model<T, U> = any;
// // type Transaction = any;
// // type Database<T, U> = any;
// /**
//  * Table 定义模块
//  */
// // export type TablesKeyType = keyof typeof tablesStructure;
// type TablesStructure = {
//   [tableName: string]: (i: {
//     s: Sequelize;
//     t: string;
//     o: { [key: string]: any };
//   }) => ModelCtor<Model<any, any>>;
// };
export type TablesType = Record<
  keyof TablesStructure,
  ModelCtor<Model<any, any>>
>;
export type ConnectionType = SqliteDatabase<Sqlite3Database, Sqlite3Statement>;
export type OrmConnectionType = {
  sequelize: Sequelize;
  tables: TablesType;
  transaction: Transaction;
};
// export interface DefineTables {
//   declareTables: (
//     sequelize: Sequelize,
//     cacheTabs: Array<any>,
//     transition?: Transaction
//   ) => Record<keyof TablesStructure, ModelCtor<Model<any, any>>>;
// }
// // 装饰器
// interface Option<T> {
//   useOrm?: boolean;
//   autoClose?: boolean;
//   useTransaction?: boolean;
//   tables?: Array<keyof T>;
// }
export class defineTables<T> implements DefineTables {
  tablesStructure?: TablesStructure;
  relation?: (tables: any) => any;
  connConf?: any;
  sequelize?: Sequelize;
  sqlite?: any;
  sqlite3?: any;
  constructor(
    tablesStructure,
    relation,
    params?: {
      connConf?: any;
      sequelize?: any;
      sqlite?: any;
      sqlite3?: any;
    }
  ) {
    this.tablesStructure = tablesStructure;
    this.relation = relation;
    this.connConf = params?.connConf;
    this.sequelize = params?.sequelize;
    this.sqlite = params?.sqlite;
    this.sqlite3 = params?.sqlite3;
  }

  // 定义表
  declareTables(
    sequelize: Sequelize,
    cacheTabs: Array<any>,
    transition?: Transaction
  ) {
    const _this = this;
    const commonOpt = {
      freezeTableName: true,
      timestamps: false,
    };
    let tables: any = {};
    if (cacheTabs && cacheTabs.length > 0) {
      // 按需初始化表
      cacheTabs.forEach((tableName: string) => {
        const model: ModelCtor<Model<any, any>> = (
          _this.tablesStructure as any
        )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
        if (transition) {
          tables[tableName] = _this.useTransaction(model, transition);
        } else {
          tables[tableName] = model;
        }
      });
    } else {
      Object.keys(_this.tablesStructure).forEach((tableName: string) => {
        const model: ModelCtor<Model<any, any>> = (
          _this.tablesStructure as any
        )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
        if (transition) {
          tables[tableName] = _this.useTransaction(model, transition);
        } else {
          tables[tableName] = model;
        }
      });
    }
    _this.relation(tables);
    return tables as Record<keyof TablesStructure, ModelCtor<Model<any, any>>>;
  }

  // 使用事务
  private useTransaction(
    model: ModelCtor<Model<any, any>>,
    transaction: Transaction
  ) {
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
      bulkCreate: async (vs, o) =>
        await model.bulkCreate(vs, { transaction, ...o }),
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
        } else {
          return Reflect.get(target, propertyKey, receiver);
        }
      },
    });
  }
  // 装饰器
  Database(option?: Option<T>) {
    const _this = this;
    const decoratorFunc = (
      target: any,
      propertyKey: string,
      { configurable, enumerable, value, writable }: PropertyDescriptor
    ) => {
      const func = async (...args: any) => {
        const autoClose = option?.autoClose ?? true; // 自动关闭，默认true
        const useTransaction = option?.useTransaction ?? false; // 是否使用事物，默认false
        let res!: any;
        if (option?.useOrm) {
          const sequelize = await ormConnectionCreate(_this.sequelize)(
            _this.connConf
          );
          let transaction = null;
          if (useTransaction) {
            transaction = await sequelize.transaction();
          }
          const tables = _this.declareTables(
            sequelize as Sequelize,
            option.tables,
            transaction
          );
          target.db = { sequelize, tables, transaction };
          try {
            res = await (value as Function).apply(target, args);
            if (useTransaction) {
              transaction.commit();
            }
          } catch (err) {
            if (useTransaction) {
              transaction.rollback();
            }
            throw err;
          }
          // res = await (value as Function).apply(target, args);
          if (autoClose && !useTransaction) {
            await sequelize.close();
          }
        } else {
          const conn = await connectionCreate(_this.sqlite, _this.sqlite3)();
          target.db = conn;
          res = await (value as Function).apply(target, args);
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
  // 废弃装饰器
  Sqlite = this.Database;
}

// 创建通用sqlite连接
export const connectionCreate = (_sqlite?: any, _sqlite3?: any) => async () => {
  try {
    const sqlite3 = require("sqlite3");
    const sqlite = require("sqlite");
    const db: ConnectionType = await sqlite.open({
      // filename: /根目录/db.sqlite.js
      // db.sqlite.js:
      // ```
      //   module.exports = { path: require('path').resolve('src', 'hybridapi', 'dbfile', 'cost_estimate.db') }
      // ```
      filename: require(require("path").resolve("db.sqlite.js")).path,
      driver: sqlite3.Database,
    });
    return db;
  } catch (err) {
    new Error("DB connect error!");
  }
};

// 创建orm通用连接
export const ormConnectionCreate =
  (_Sequelize?: any) => async (connConf?: any) => {
    try {
      let sqliteConfig: any = [
        {
          dialect: "sqlite",
          storage: require(require("path").resolve("db.sqlite.js")).path,
        },
      ];
      const commonConfig = loadConfig(connConf);
      if (commonConfig) {
        sqliteConfig = commonConfig;
      }
      const sequelize: Sequelize = new Sequelize(...sqliteConfig);
      return sequelize;
    } catch (err) {
      new Error("DB connect error!");
    }
  };

// 读取数据库配置文件
const loadConfig = (connConf?: any) => {
  // parsed: /项目根目录/.env
  // .env: DB_DRIVER=sqlite
  if (connConf) {
    if (connConf.driver === "sqlite") {
      return [
        {
          dialect: "sqlite",
          storage: connConf.path,
        },
      ];
    } else if (connConf.driver === "mysql") {
      return [
        connConf.database,
        connConf.username,
        connConf.password,
        {
          host: connConf.host,
          port: connConf.port,
          dialect: "mysql",
        },
      ];
    } else if (connConf.driver === "postgres") {
      return [
        connConf.database,
        connConf.username,
        connConf.password,
        {
          host: connConf.host,
          port: connConf.port,
          dialect: "postgres",
        },
      ];
    } else {
      return [];
    }
  }
  const { parsed } = require("dotenv").config();
  if (parsed.DB_DRIVER === "sqlite") {
    const _connConf = require(require("path").resolve("db.sqlite.js"));
    return [
      {
        dialect: "sqlite",
        storage: _connConf.path,
      },
    ];
  } else if (parsed.DB_DRIVER === "mysql") {
    const _connConf = require(require("path").resolve("db.mysql.js"));
    return [
      _connConf.database,
      _connConf.username,
      _connConf.password,
      {
        host: _connConf.host,
        port: _connConf.port,
        dialect: "mysql",
      },
    ];
  } else if (parsed.DB_DRIVER === "postgres") {
    const _connConf = require(require("path").resolve("db.postgres.js"));
    return [
      _connConf.database,
      _connConf.username,
      _connConf.password,
      {
        host: _connConf.host,
        port: _connConf.port,
        dialect: "postgres",
      },
    ];
  } else {
    return [];
  }
};

/**
 *  restful请求装饰器
 */
export const Get = (url) => {
  const decoratorFunc = (
    target: any,
    propertyKey: string,
    { configurable, enumerable, value, writable }: PropertyDescriptor
  ) => {
    const func = async (...args) => {
      const res = await (value as Function).apply(target, args);
      return res;
    };
    if (target.$restful) {
      target.$restful[propertyKey] = {
        url,
        method: "get",
      };
    } else {
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
};

export const Post = (url) => {
  const decoratorFunc = (
    target: any,
    propertyKey: string,
    { configurable, enumerable, value, writable }: PropertyDescriptor
  ) => {
    const func = async (...args) => {
      const res = await (value as Function).apply(target, args);
      return res;
    };
    if (target.$restful) {
      target.$restful[propertyKey] = {
        url,
        method: "post",
      };
    } else {
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
};

/**
 * 插件 factory
 */
// 装饰器绑定属性
export const injectBind = (
  classObj: any,
  funcName: string,
  options: { [injectName: string]: any }
) => {
  if (!classObj.$inject) {
    classObj.$inject = {};
  }
  for (const injectName in options) {
    if (classObj.$inject[injectName]) {
      // 绑定函数，多装饰器绑定
      classObj.$inject[injectName][funcName] = options[injectName];
    } else {
      classObj.$inject[injectName] = {
        [funcName]: options[injectName],
      };
    }
  }
};
// 装饰器解除属性绑定
export const injectRemove = (
  classObj: any,
  injectName: string,
  funcName?: string
) => {
  if (!classObj.$inject) {
    classObj.$inject = {};
  }
  if (classObj.$inject[injectName]) {
    if (funcName) {
      delete classObj.$inject[injectName][funcName];
    } else {
      delete classObj.$inject[injectName];
    }
  }
};
// 自动注入
/**
 * service方法参数：
 * arg1：页面传输参数
 * arg2：插件参数 + 页面传输参数
 * arg3：请求交互的ctx对象
 */
// export type FullResType = {
//   data: any;
//   [injectName: string]: any;
// };
// export type ServiceFunctionArgs = [
//   any /*data*/,
//   FullResType /*fullRes*/,
//   any /*ctx*/
// ];
// export type PluginConfig = {
//   [injectorName: string]: {
//     method?: "get" | "post";
//     before?: {
//       plugin: (ctx: any, option?: any) => any;
//       replaceProps: boolean;
//     };
//     after?: {
//       plugin: (res: any, ctx: any, option?: any) => any;
//       replaceProps: boolean;
//     };
//     intercept?: (
//       func: (...args: ServiceFunctionArgs) => any,
//       args: ServiceFunctionArgs,
//       option?: any
//     ) => any;
//   };
// };
export const servInjector = (
  target: any,
  funcName: string,
  config: PluginConfig
) => {
  // 默认post
  let method = "post";
  // 插件中如果有get优先get请求
  for (const injectName in config) {
    // 插件有指定method
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
  // 只截取第一个装饰器插件中的拦截器
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
  //
  const controller = async (ctx: any) => {
    const fullRes = {} as FullResType; // 插件返回值
    let data = null as any;
    // 前拦截器
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
    // 后拦截器
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
// 路由绑定方法
export const routeBinder = (router, serviceModules, config = {}) => {
  const controllers = {};
  for (let name in serviceModules) {
    const serviceModule = serviceModules[name];
    // 获取模块函数名
    const moduleFuncs = Object.getOwnPropertyNames(
      serviceModule.prototype
    ).filter(
      (f) => f !== "constructor" && f !== "$inject" && f.toLowerCase() !== "db"
    );
    // const moduleFuncs = Object.getOwnPropertyNames(serviceModule.prototype).filter((f) => f !== 'constructor');
    // 实例化模块
    const moduleObj = Reflect.construct(serviceModule, []);
    for (let subName of moduleFuncs) {
      // const controller = async (ctx: any) => {
      //     const data = ctx.request.body;
      //     const res = await moduleObj[subName](data, ctx);
      //     ctx.body = res;
      // }
      const [method, controller] = servInjector(moduleObj, subName, config);
      router[method as string](`/${name}/${subName}`, controller);
      // console.log(`/${name}/${subName}`)
      controllers[`${name}_${subName}`] = controller;
    }
  }
  return controllers;
};
// restful 绑定方法
export const restfulBinder = (router, serviceModules) => {
  const controllers = {};
  for (let name in serviceModules) {
    const serviceModule = serviceModules[name];
    // 获取模块函数名
    const moduleFuncs = Object.getOwnPropertyNames(
      serviceModule.prototype
    ).filter((f) => f !== "constructor" && f !== "$restful");
    // 实例化模块
    const moduleObj = Reflect.construct(serviceModule, []);
    for (let subName of moduleFuncs) {
      const { url, method } = moduleObj.$restful[subName];
      const controller = async (ctx: any) => {
        if (method?.toLowerCase() === "get") {
          const { params } = ctx;
          const res = await moduleObj[subName](params || {}, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "post") {
          const data = ctx.request.body;
          const res = await moduleObj[subName](data, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "put") {
          const data = ctx.request.body;
          const res = await moduleObj[subName](data, ctx);
          ctx.body = res;
        } else if (method?.toLowerCase() === "delete") {
          const { params } = ctx;
          const res = await moduleObj[subName](params || {}, ctx);
          ctx.body = res;
        } else {
          return await moduleObj[subName](ctx);
        }
      };
      if (method?.toLowerCase() === "get") {
        router.get(url, controller);
      } else if (method?.toLowerCase() === "post") {
        router.post(url, controller);
      } else if (method?.toLowerCase() === "put") {
        router.put(url, controller);
      } else if (method?.toLowerCase() === "delete") {
        router.delete(url, controller);
      } else {
        router[method](url, controller);
      }
      // console.log(`/${name}/${subName}`)
      controllers[`${url}`] = controller;
    }
  }
  return controllers;
};
// 装饰器类型声明
// export type Injector<T> = (option?: T) => any;
export const injectorBuilder = (
  injectName,
  callbacks?: { onCreate; onBefore; onAfter }
) => {
  const onCreate = callbacks?.onCreate || (() => ""); // 装饰器声明时
  const onBefore = callbacks?.onBefore || ((...args) => args); // 函数调用前
  const onAfter = callbacks?.onAfter || ((res) => res); // 函数调用后
  const Injector = (option?: any) => {
    const decoratorFunc = (
      target: any,
      propertyKey: string, // 方法名
      { configurable, enumerable, value, writable }: PropertyDescriptor
    ) => {
      onCreate(target, propertyKey, option);
      const func = async (...args) => {
        const _args = await onBefore(...args);
        const _res = await (value as Function).apply(target, _args);
        const res = await onAfter(_res);
        return res;
      };
      injectBind(target, propertyKey, {
        // target['$inject'][injectName][propertyKey] -> { option }
        [injectName]: { option },
      });
      return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
  };
  return Injector;
};

// 类装饰器
export const classInjectorBuilder = (
  injectName,
  callbacks?: { onDecorate }
) => {
  // 定义装饰器工厂
  const Injector = (option?: any) => {
    const decoratorFunc = (target: any) => {
      // 生命周期
      if (callbacks?.onDecorate) {
        // 装饰时调用
        callbacks.onDecorate(target, option);
      }
      injectBind(target, "$class", {
        [injectName]: { option }, // target['$inject'][injectName]['$class'] -> { option }
      });
      return target;
    };
    return decoratorFunc;
  };
  return Injector;
};

// 参数装饰器
export const propsInjectorBuilder = (injectName, callbacks: { onInject }) => {
  const onInject =
    callbacks?.onInject || ((target, methodName, paramsIndex) => ""); // 参数注入时调用
  // 定义装饰器工厂
  const Injector = (options?: any) => {
    const decoratorFunc = (target: any, methodName: any, paramsIndex: any) => {
      onInject(target, methodName, paramsIndex);
    };
  };
  return Injector;
};
