import {
  Sequelize,
  ModelStatic,
  Model,
  Transaction,
  Options,
  PoolOptions,
  ModelAttributes,
  ModelOptions,
} from "sequelize";
import {
  loadConfig,
  standardTransfor,
  Transfor,
} from "../database/configurator";
import { OrmBaseLoader, OrmInjectTargetType } from "../database/baseDefined";

// Json根据Key获取value的类型
export type ExtractResult<T, U> = T extends keyof U ? U[T] : never;
// 对象合并，合并后的类型与K相互继承
export type Combine<T, K = { [key: string]: any }> = {
  [P in keyof T]: T[P];
} & K;
// 对象合并（转换any类型），合并后的类型与K相互继承
export type CombineAny<T, K = { [key: string]: any }> = {
  [P in keyof T]: any;
} & K;
// 继承Model<any, any>并注入column字段的类型
export type CombineColumnModel<T> = CombineAny<T, Model<any, any>>;

// 转换any类型
export type TransforAny<M> = Record<keyof M, any>;

// 表Models类型
// export type TablesModelType<T extends TablesStructure = TablesStructure> =
//   Record<keyof T, ModelStatic<Model<any, any>>>;
export type TablesModelType<T extends TablesStructure = TablesStructure> = {
  [P in keyof T]: ReturnType<T[P]> extends any[]
    ? ModelStatic<CombineColumnModel<ReturnType<T[P]>[0]>>
    : ModelStatic<Model<any, any>>;
    // : TransforAny<ModelStatic<any>>;
};

// 模块接口
export interface OrmInterface<T extends TablesStructure = TablesStructure>
  extends OrmInjectTargetType {
  db: DB<T>;
}
// 用于Service模块db对象注入的继承类
export class OrmSequelize<T extends TablesStructure = TablesStructure>
  implements OrmInterface
{
  db: DB<T>;
}
// 重写define方法类型
export type DefineModel<AT = any> = (
  model: ModelAttributes<Model<any, any>, AT>,
  option?: ModelOptions<Model<any, any>>
) => ModelStatic<Model<any, any>>;
// table构造器参数
export type TablesStructureProps = {
  s: Sequelize;
  t: string /* 表名 */;
  o: { [key: string]: any } /* 参数 */;
};
// table构造类型
export type TablesStructure = {
  [tableName: string]: (
    define?: DefineModel | TablesStructureProps,
    i?: TablesStructureProps
  ) => ModelStatic<Model<any, any>> | any[];
};
// table关系方法类型
export type Relation<T extends TablesStructure = TablesStructure> = (
  tableModels: TablesModelType<T>
) => void;
// Database装饰器参数
export type DatabaseOptions<T extends TablesStructure = TablesStructure> = {
  /** @deprecated use useOrm */
  useOrm?: boolean;
  tables?: Array<keyof T>;
  relation?: Relation<T>;
  useTransaction?: boolean;
};
// 全局参数
export type GlobalOptions = {
  tablesStructure?: TablesStructure;
  relation?: Relation;
  useBaseConfig?: boolean;
  useAlwaysConnection?: boolean;
  useMultiConnection?: boolean; // sqlite不支持
  useTransaction?: boolean; // 未使用
  sequelizeArgs?: any[];
};
// 参数默认值
export const DefaultOptions = {
  useBaseConfig: true,
  useTransaction: false,
  useAlwaysConnection: false,
  useMultiConnection: false, // sqlite不支持
  connectionKey: "global-connection",
};
// DB注入对象类型
export type DB<T extends TablesStructure = TablesStructure> = {
  sequelize: Sequelize;
  transaction: Transaction;
  tables: TablesModelType<T>;
};

export class OrmLoader implements OrmBaseLoader<DatabaseOptions> {
  // 连接池对象
  connectionPool: {
    [key: string | number | symbol]: Pick<DB, "sequelize" | "transaction">;
  } = {};
  distroyConnect(key: string | symbol | number) {
    if (
      this.options?.useAlwaysConnection ??
      DefaultOptions.useAlwaysConnection
    ) {
      // nothing to do
    } else {
      delete this.connectionPool[key];
    }
  }
  // 全局选项，外层注入
  options: GlobalOptions;
  // 创建连接
  async connect(connectOptions?: {
    key?: string | symbol;
    args?: any[];
  }): Promise<void> {
    const useBaseConfig =
      this.options.useBaseConfig ?? DefaultOptions.useBaseConfig;
    const connectionKey = connectOptions?.key || DefaultOptions.connectionKey;
    this.connectionPool[connectionKey] = {} as Pick<
      DB,
      "sequelize" | "transaction"
    >;
    try {
      const options: any[] =
        this.options?.sequelizeArgs ||
        loadConfig({
          env: useBaseConfig ? true : false,
          transfor: useBaseConfig ? baseTransfor : standardTransfor,
        }) ||
        [];
      if (connectOptions?.args && connectOptions?.args.length > 0) {
        this.connectionPool[connectionKey].sequelize = new Sequelize(
          ...connectOptions?.args
        );
      } else {
        this.connectionPool[connectionKey].sequelize = new Sequelize(
          ...options
        );
      }
    } catch (err) {
      this.distroyConnect(connectionKey);
      throw err;
    }
  }
  // 装饰方法调用前触发
  async onCallBefore(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions
  ): Promise<{ connectionKey: string | symbol; transaction?: Transaction }> {
    const _this = this;
    // 初始化key
    let connectionKey: string | symbol = DefaultOptions.connectionKey;
    // 初始化事务
    let transaction: Transaction = null as any;
    // 使用多个连接实体
    const useMultiConnection =
      this.options?.useMultiConnection ?? DefaultOptions.useMultiConnection;
    // 使用长连接
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    if (!useAlwaysConnection) {
      if (useMultiConnection) {
        connectionKey = Symbol(funcName);
      }
      this.connect({ key: connectionKey });
    }
    try {
      // 使用事物
      let useTransaction =
        options?.useTransaction ?? DefaultOptions.useTransaction;
      // 按需设置事务对象
      if (useTransaction) {
        transaction = await this.connectionPool[
          connectionKey
        ].sequelize.transaction();
      }
      if (!useAlwaysConnection) {
        this.connectionPool[connectionKey].transaction = transaction;
      } else {
        this.connectionPool[connectionKey].transaction = null as any;
      }
      const tables = this.declareTables(
        this.connectionPool[connectionKey].sequelize,
        transaction,
        <string[]>options.tables,
        options.relation as any
      );
      // target.db = this.db;
      target.db = new Proxy(
        {},
        {
          get(context: any, propertyKey: string, receiver: any) {
            if (propertyKey === "sequelize") {
              return _this.connectionPool[connectionKey].sequelize;
            } else if (propertyKey === "transaction") {
              return _this.connectionPool[connectionKey].transaction;
            } else if (propertyKey === "tables") {
              return tables;
            } else {
              return Reflect.get(context, propertyKey, receiver);
            }
          },
        }
      );
      // 返回key
      return { connectionKey, transaction };
    } catch (err) {
      this.distroyConnect(connectionKey);
      throw err;
    }
  }
  // 装饰方法调用后触发
  async onCallAfter(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions,
    callBeforeResult: {
      connectionKey: string | symbol;
      transaction?: Transaction;
    }
  ): Promise<void> {
    const connectionKey = callBeforeResult.connectionKey;
    // 使用长连接
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    // 使用事物
    const useTransaction = options?.useTransaction ?? false;
    if (useTransaction) {
      await callBeforeResult?.transaction?.commit();
    }
    if (!useAlwaysConnection) {
      // 新版本自动关闭
      // try {
      //   await this.connectionPool[connectionKey].sequelize.close();
      // } catch (e) {}
    }
    this.distroyConnect(connectionKey);
  }
  // 装饰方法调用报错时触发
  async onCallError(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions,
    callBeforeResult:
      | { connectionKey: string | symbol; transaction?: Transaction }
      | undefined,
    callAfterResult: any,
    error
  ): Promise<void> {
    console.error(error.original); // 输出详细错误信息
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    const useTransaction = options?.useTransaction ?? false;
    if (useTransaction) {
      await callBeforeResult?.transaction?.rollback();
    }
    if (!useAlwaysConnection) {
      try {
        if (callBeforeResult?.connectionKey) {
          await this.connectionPool[
            callBeforeResult?.connectionKey
          ].sequelize.close();
        }
      } catch (e) {}
    }
    this.distroyConnect(callBeforeResult?.connectionKey as any);
  }

  // 定义表
  declareTables(
    sequelize: Sequelize,
    transition: Transaction,
    cacheTabs: string[],
    relation: Relation
  ): TablesModelType {
    const modelOptions = {
      freezeTableName: true,
      timestamps: false,
    };
    // 简化模型定义
    const defineModel =
      (tableName: string) =>
      (
        model: ModelAttributes<Model<any, any>>,
        option?: ModelOptions<Model<any, any>>
      ) =>
        sequelize.define(tableName, model, {
          ...modelOptions,
          ...(option || {}),
        });
    // 表模块构建
    const defineTablesModel = (tableName: string) => {
      let model: ModelStatic<Model<any, any>> = null as any;
      let res: ReturnType<TablesStructure[string]> = null as any;
      try {
        res = (this.options.tablesStructure as TablesStructure)[tableName](defineModel(tableName), {
          s: sequelize,
          t: tableName,
          o: modelOptions,
        });
      } catch (err1) {
        try {
          res = (this.options.tablesStructure as TablesStructure)[tableName]({
            s: sequelize,
            t: tableName,
            o: modelOptions,
          });
        } catch (err2) {
          throw [err1, err2];
        }
      }
      // 如果返回值是数组，则返回值代表参数
      if (res instanceof Array) {
        model = defineModel(tableName)(res[0], res[1]);
      } else {
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
        } else {
          tables[tableName] = useDefaultModel(model);
        }
      });
      if (relation) {
        relation(tables);
      }
    } else {
      // 全表实例化
      for (const tableName in this.options.tablesStructure) {
        let model = defineTablesModel(tableName);
        if (transition) {
          tables[tableName] = useTransaction(model, transition);
        } else {
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

// 重写model
export type RewriteModelStatic<T extends keyof ModelStatic<Model<any, any>>> =
  Pick<ModelStatic<Model<any, any>>, T>;
// 重写属性
export type RewriteModelProps = RewriteModelStatic<
  | "create"
  | "update"
  | "destroy"
  | "bulkCreate"
  | "findAll"
  | "findOne"
  | "max"
  | "min"
  | "sum"
  | "count"
>;
export function modelPropsInject(
  model: ModelStatic<Model<any, any>>,
  props: any = {}
): RewriteModelProps {
  const rewrite = {
    // 重写方法
    create: async (v, o) => await model.create(v, { ...props, ...o }),
    update: async (v, o) => await model.update(v, { ...props, ...o }),
    destroy: async (o) => await model.destroy({ ...props, ...o }),
    bulkCreate: async (vs, o) => await model.bulkCreate(vs, { ...props, ...o }),
    findAll: async (o) => await model.findAll({ ...props, ...o }),
    findOne: async (o) => await model.findOne({ ...props, ...o }),
    max: async (f, o) => await model.max(f, { ...props, ...o }),
    min: async (f, o) => await model.min(f, { ...props, ...o }),
    sum: async (f, o) => await model.sum(f, { ...props, ...o }),
    count: async (o) => await model.count({ ...props, ...o }),
  };
  return rewrite as RewriteModelProps;
}
export function injectTransaction(
  model: ModelStatic<Model<any, any>>,
  transaction: Transaction
) {
  return modelPropsInject(model, { transaction });
}
// 重写属性枚举
export type RewriteModelKeys = keyof RewriteModelProps;
// 使用事务
export function useTransaction(
  model: ModelStatic<Model<any, any>>,
  transaction: Transaction
): RewriteModelProps & ModelStatic<Model<any, any>> {
  const rewrite = injectTransaction(model, transaction);
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
export function useDefaultModel(
  model: ModelStatic<Model<any, any>>
): RewriteModelProps & ModelStatic<Model<any, any>> {
  const rewrite = modelPropsInject(model);
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
/** @deprecated use BaseConfigType */
export type BaseConfigType = {
  database?: string; // mysql | postgres
  host?: string; // mysql | postgres
  port?: number; // mysql | postgres
  username?: string; // mysql | postgres
  password?: string; // mysql | postgres
  path?: string; // only sqlite
  pool?: PoolOptions;
};
// 简化配置
/** @deprecated use baseTransfor */
export const baseTransfor: Transfor<
  BaseConfigType,
  { DB_DRIVER: "mysql" | "postgres" | "sqlite" }
> = (configDetail, env) => {
  const defaultPool = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  };
  const driver = env?.DB_DRIVER;
  if (driver === "sqlite") {
    return [
      {
        dialect: "sqlite",
        storage: configDetail.path,
        pool: configDetail.pool || defaultPool,
      },
    ];
  } else if (driver === "mysql") {
    return [
      configDetail.database,
      configDetail.username,
      configDetail.password,
      {
        host: configDetail.host,
        port: configDetail.port,
        dialect: "mysql",
        pool: configDetail.pool || defaultPool,
      },
    ];
  } else if (driver === "postgres") {
    return [
      configDetail.database,
      configDetail.username,
      configDetail.password,
      {
        host: configDetail.host,
        port: configDetail.port,
        dialect: "postgres",
        pool: configDetail.pool || defaultPool,
      },
    ];
  } else {
    return [];
  }
};
