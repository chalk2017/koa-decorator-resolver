import {
  Sequelize,
  ModelCtor,
  Model,
  Transaction,
  Options,
  ModelAttributes,
  ModelOptions,
} from "sequelize";
import { loadConfig, standardTransfor, Transfor } from "../database/configurator";
import { OrmBaseLoader, OrmInjectTargetType } from "../database/baseDefined";

export type TablesModelType<T extends TablesStructure = TablesStructure> =
  Record<keyof T, ModelCtor<Model<any, any>>>;

// 模块接口
export interface OrmInterface<T extends TablesStructure = TablesStructure>
  extends OrmInjectTargetType {
  db: DB<T>;
}

export class OrmSequelize<T extends TablesStructure = TablesStructure>
  implements OrmInterface
{
  db: DB<T>;
}

export type DefineModel = (
  model: ModelAttributes<Model<any, any>>,
  option?: ModelOptions<Model<any, any>>
) => ModelCtor<Model<any, any>>;
export type TablesStructureProps = {
  s: Sequelize;
  t: string /* 表名 */;
  o: { [key: string]: any } /* 参数 */;
};
export type TablesStructure = {
  [tableName: string]: (
    define: DefineModel,
    i: TablesStructureProps
  ) => ModelCtor<Model<any, any>>;
};

export type Relation<T extends TablesStructure = TablesStructure> = (
  tableModels: TablesModelType<T>
) => void;

export type DatabaseOptions<T extends TablesStructure = TablesStructure> = {
  tables?: Array<keyof T>;
  relation?: Relation<T>;
  useTransaction?: boolean;
};
export type GlobalOptions = {
  tablesStructure?: TablesStructure;
  relation?: Relation;
  useBaseConfig?: boolean;
  useAlwaysConnection?: boolean;
};
export const DefaultOptions = {
  useBaseConfig: true,
  useTransaction: false,
  useAlwaysConnection: false,
};
export type DB<T extends TablesStructure = TablesStructure> = {
  sequelize: Sequelize;
  transaction: Transaction;
  tables: TablesModelType<T>;
};

export class OrmLoader implements OrmBaseLoader<DatabaseOptions> {
  // db实例
  db: DB = {
    sequelize: undefined,
    transaction: undefined,
    tables: undefined,
  };
  // 全局选项，外层注入
  options: GlobalOptions;
  // 创建连接
  async connect(...args) {
    const useBaseConfig =
      this.options.useBaseConfig ?? DefaultOptions.useBaseConfig;
    try {
      const options: any[] =
        loadConfig({
          env: useBaseConfig ? true : false,
          transfor: useBaseConfig ? baseTransfor : standardTransfor,
        }) || [];
      if (args && args.length > 0) {
        this.db.sequelize = new Sequelize(...args);
      } else {
        this.db.sequelize = new Sequelize(...options);
      }
    } catch (err) {
      new Error("DB connect error!");
    }
  }
  // 装饰方法调用前触发
  async onCallBefore(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions
  ) {
    // 使用长连接
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    if (!useAlwaysConnection) {
      this.connect();
    }
    // 使用事物
    const useTransaction =
      options?.useTransaction ?? DefaultOptions.useTransaction;
    if (useTransaction) {
      this.db.transaction = await this.db.sequelize.transaction();
    }
    this.db.tables = this.declareTables(
      this.db.sequelize,
      this.db.transaction,
      <string[]>options.tables,
      options.relation
    );
    target.db = this.db;
  }
  // 装饰方法调用后触发
  async onCallAfter(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions
  ) {
    // 使用长连接
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    // 使用事物
    const useTransaction = options?.useTransaction ?? false;
    if (useTransaction) {
      await this.db.transaction.commit();
    }
    if (!useAlwaysConnection) {
      try {
        await this.db.sequelize.close();
      } catch (e) {}
    }
  }
  // 装饰方法调用报错时触发
  async onCallError(target: OrmInterface, funcName, options, error) {
    const useAlwaysConnection =
      this.options?.useAlwaysConnection ?? DefaultOptions.useAlwaysConnection;
    const useTransaction = options?.useTransaction ?? false;
    if (useTransaction) {
      await this.db.transaction.rollback();
    }
    if (!useAlwaysConnection) {
      try {
        await this.db.sequelize.close();
      } catch (e) {}
    }
  }

  // 定义表
  declareTables(
    sequelize: Sequelize,
    transition: Transaction,
    cacheTabs: string[],
    relation: Relation
  ) {
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
    // 表模型集
    let tables = {};
    if (cacheTabs && cacheTabs.length > 0) {
      // 按需初始化表
      cacheTabs.forEach((tableName) => {
        const model = this.options.tablesStructure[tableName](
          defineModel(tableName),
          {
            s: sequelize,
            t: tableName,
            o: modelOptions,
          }
        );
        if (transition) {
          tables[tableName] = useTransaction(model, transition);
        } else {
          tables[tableName] = model;
        }
      });
      if (relation) {
        relation(tables);
      }
    } else {
      // 全表实例化
      for (const tableName in this.options.tablesStructure) {
        const model = this.options.tablesStructure[tableName](
          defineModel(tableName),
          {
            s: sequelize,
            t: tableName,
            o: modelOptions,
          }
        );
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

// 使用事务
export const injectTransaction = (
  model: ModelCtor<Model<any, any>>,
  transaction: Transaction
) => {
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
    count: async (o) => await model.count({ transaction, ...o }),
  };
  return rewrite;
};
// 重写属性
export type RewriteModelProps = ReturnType<typeof injectTransaction>;
// 重写属性枚举
export type RewriteModelKeys = keyof RewriteModelProps;
// 使用事务
export const useTransaction = (
  model: ModelCtor<Model<any, any>>,
  transaction: Transaction
): RewriteModelProps & ModelCtor<Model<any, any>> => {
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
};
/** @deprecated use BaseConfigType */
export type BaseConfigType = {
  database?: string; // mysql | postgres
  host?: string; // mysql | postgres
  port?: number; // mysql | postgres
  username?: string; // mysql | postgres
  password?: string; // mysql | postgres
  path?: string; // only sqlite
};
// 简化配置
/** @deprecated use baseTransfor */
export const baseTransfor: Transfor<
  BaseConfigType,
  { DB_DRIVER: "mysql" | "postgres" | "sqlite" }
> = (configDetail, env) => {
  const driver = env.DB_DRIVER;
  if (driver === "sqlite") {
    return [
      {
        dialect: "sqlite",
        storage: configDetail.path,
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
      },
    ];
  } else {
    return [];
  }
};