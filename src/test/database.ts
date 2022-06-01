import { Sequelize, STRING, ModelCtor, Model } from "sequelize";
import {
  TablesStructureProps,
  DefineModel,
  defineTables,
  Relation,
  TablesModelType,
} from "../index";

// 实体定义方式1
export const tablesStructure = {
  USER: (define: DefineModel) =>
    define({
      USERID: {
        type: STRING(20),
        primaryKey: true,
      },
      USERNAME: {
        type: STRING(20),
        primaryKey: true,
      },
      PASSWORD: STRING(50),
    }),
};

// 实体定义方式2
export const tablesStructureCustom = {
  USER: (_, i: TablesStructureProps) =>
    i.s.define(
      i.t,
      {
        USERID: {
          type: STRING(20),
          primaryKey: true,
        },
        USERNAME: {
          type: STRING(20),
          primaryKey: true,
        },
        PASSWORD: STRING(50),
      },
      i.o
    ),
};
// 解析类型
export type TablesStructureType = typeof tablesStructure;
// 生成实体
const defineTablesInstance = defineTables<TablesStructureType>(
  tablesStructure, // 表结构
  (tables: TablesModelType<TablesStructureType>) => {
    // 表关联管理
  },
  {
    useBaseConfig: false,
    useAlwaysConnection: false,
  }
);
// 装饰器
export const Database = defineTablesInstance.Database;
// 连接
export const connect = defineTablesInstance.connect;
