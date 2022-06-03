"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.Database = exports.tablesStructure = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
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
exports.tablesStructure = {
    USER: () => [
        {
            USERID: {
                type: (0, sequelize_1.STRING)(20),
                primaryKey: true,
            },
            USERNAME: {
                type: (0, sequelize_1.STRING)(20),
                primaryKey: true,
            },
            PASSWORD: (0, sequelize_1.STRING)(50),
        },
    ],
};
// 生成实体
const defineTablesInstance = (0, index_1.defineTables)(exports.tablesStructure, // 表结构
(tables) => {
    // 表关联管理
    // tables.USER.hasMany(tables.USER);
}, {
// useBaseConfig: false,
// useAlwaysConnection: false,
});
// 装饰器
exports.Database = defineTablesInstance.Database;
// 连接
exports.connect = defineTablesInstance.connect;
//# sourceMappingURL=database.js.map