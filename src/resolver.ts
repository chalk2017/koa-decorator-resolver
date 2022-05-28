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
