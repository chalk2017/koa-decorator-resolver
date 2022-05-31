import { ormBinder } from "src/database/binder";
import {
  Sequelize,
  STRING,
  INTEGER,
  BIGINT,
  DATE,
  TIME,
  DATEONLY,
  BOOLEAN,
  FLOAT,
  DOUBLE,
  ModelCtor,
  Model,
} from "sequelize";
export const tablesStructure = {
  USER: (i: any) =>
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
export type TablesType = Record<
  keyof typeof tablesStructure,
  ModelCtor<Model<any, any>>
>;
const defineTables = ormBinder<typeof tablesStructure>(
  tablesStructure,
  (tables: TablesType) => {}
);
export const Database = defineTables.Database;
export const connect = defineTables.connect;
