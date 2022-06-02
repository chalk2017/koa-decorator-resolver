import { DefineDatabase } from "../database/baseDefined";
import {
  OrmLoader,
  TablesStructure,
  Relation,
  DatabaseOptions,
  GlobalOptions,
} from "./sequelize.loader";

export function defineTables<T extends TablesStructure = TablesStructure>(
  tablesStructure: T,
  relation: Relation<typeof tablesStructure>,
  option?: Omit<GlobalOptions, "tablesStructure" | "relation">
): {
  connect: DefineDatabase<DatabaseOptions<typeof tablesStructure>>["connect"];
  Database: DefineDatabase<DatabaseOptions<typeof tablesStructure>>["database"];
} {
  const database = new DefineDatabase<DatabaseOptions<typeof tablesStructure>>(
    OrmLoader,
    {
      tablesStructure,
      relation,
      ...option || {},
    }
  );
  return {
    connect: database.connect,
    Database: database.database,
  };
}
