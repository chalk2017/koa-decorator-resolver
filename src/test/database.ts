import { Sequelize, STRING, ModelCtor, Model } from "sequelize";
import { TablesStructure, defineTables } from "../index";

// // 实体定义: 执行define函数定义（原始sequelize方式）
// export const tablesStructureSample = {
//   USER: (define) =>
//     define({
//       USERID: {
//         type: STRING(20),
//         primaryKey: true,
//       },
//       USERNAME: {
//         type: STRING(20),
//         primaryKey: true,
//       },
//       PASSWORD: STRING(50),
//     }),
// };

// // 实体定义: 执行define函数定义（原始sequelize方式）
// export const tablesStructureCustom = {
//   USER: (_, i: TablesStructureProps) =>
//     i.s.define(
//       i.t,
//       {
//         USERID: {
//           type: STRING(20),
//           primaryKey: true,
//         },
//         USERNAME: {
//           type: STRING(20),
//           primaryKey: true,
//         },
//         PASSWORD: STRING(50),
//       },
//       i.o
//     ),
// };

// 实体定义（可以自动解析column）
export const tablesStructure = {
  USER: () => [
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
  ],
};

// 生成实体
const defineTablesInstance = defineTables(
  tablesStructure, // 表结构
  (tables) => {
    // 表关联管理
    // tables.USER.hasMany(tables.USER);
  },
  {
    // useBaseConfig: false,
    // useAlwaysConnection: false,
  }
);
// 装饰器
export const Database = defineTablesInstance.Database;
// 连接
export const connect = defineTablesInstance.connect;
