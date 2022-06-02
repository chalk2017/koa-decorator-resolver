import {
  Sequelize,
  ModelCtor,
  Model,
  Transaction,
  Options,
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

// 表Models类型
// export type TablesModelType<T extends TablesStructure = TablesStructure> =
//   Record<keyof T, ModelCtor<Model<any, any>>>;
export type TablesModelType<T extends TablesStructure = TablesStructure> = {
  [P in keyof T]: ReturnType<T[P]> extends any[]
    ? ModelCtor<CombineColumnModel<ReturnType<T[P]>[0]>>
    : ModelCtor<Model<any, any>>;
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
) => ModelCtor<Model<any, any>>;
// table构造器参数
export type TablesStructureProps = {
  s: Sequelize;
  t: string /* 表名 */;
  o: { [key: string]: any } /* 参数 */;
};
// table构造类型
export type TablesStructure = {
  [tableName: string]: (
    define: DefineModel,
    i: TablesStructureProps
  ) => ModelCtor<Model<any, any>> | any[];
};
// table关系方法类型
export type Relation<T extends TablesStructure = TablesStructure> = (
  tableModels: TablesModelType<T>
) => void;
// Database装饰器参数
export type DatabaseOptions<T extends TablesStructure = TablesStructure> = {
  tables?: Array<keyof T>;
  relation?: Relation<T>;
  useTransaction?: boolean;
  [key: string]: any;
};
// 全局参数
export type GlobalOptions = {
  tablesStructure?: TablesStructure;
  relation?: Relation;
  useBaseConfig?: boolean;
  useAlwaysConnection?: boolean;
};

// DB注入对象类型
export type DB<T extends TablesStructure = TablesStructure> = {
  sequelize: Sequelize;
  transaction: Transaction;
  tables: TablesModelType<T>;
};

export class OrmLoader implements OrmBaseLoader<DatabaseOptions> {
  // db实例
  db: DB;
  // 全局选项，外层注入
  options: GlobalOptions;
  // 创建连接
  connect(...args: any): Promise<void>;
  // 装饰方法调用前触发
  onCallBefore(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions
  ): Promise<void>;
  // 装饰方法调用后触发
  onCallAfter(
    target: OrmInterface,
    funcName: string,
    options: DatabaseOptions
  ): Promise<void>;
  // 装饰方法调用报错时触发
  onCallError(target: OrmInterface, funcName, options, error): Promise<void>;

  // 定义表
  declareTables(
    sequelize: Sequelize,
    transition: Transaction,
    cacheTabs: string[],
    relation: Relation
  ): TablesModelType;
}

// 使用事务
export type RewriteModelCtor<T extends keyof ModelCtor<Model<any, any>>> = Pick<
  ModelCtor<Model<any, any>>,
  T
>;
// 重写属性
export type RewriteModelProps = RewriteModelCtor<
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
export function injectTransaction(
  model: ModelCtor<Model<any, any>>,
  transaction: Transaction
): RewriteModelProps;
// 重写属性枚举
export type RewriteModelKeys = keyof RewriteModelProps;
// 使用事务
export function useTransaction(
  model: ModelCtor<Model<any, any>>,
  transaction: Transaction
): RewriteModelProps & ModelCtor<Model<any, any>>;

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
>;
