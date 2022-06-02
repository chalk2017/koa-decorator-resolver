import { defineDatabase } from "../database/baseDefined";
import {
  OrmLoader,
  TablesStructure,
  Relation,
  DatabaseOptions,
  GlobalOptions,
} from "./sequelize.loader";

// export function defineTables<T extends TablesStructure = TablesStructure>(
//   tablesStructure: T,
//   relation: Relation<T>,
//   option: Omit<GlobalOptions, "tablesStructure" | "relation"> = {}
// ) {
//   const database = new defineDatabase<DatabaseOptions<T>>(OrmLoader, {
//     tablesStructure,
//     relation,
//     ...option,
//   });
//   return {
//     connect: database.connect,
//     Database: database.database,
//   };
// }

export function defineTables<T extends TablesStructure = TablesStructure>(
  tablesStructure: T,
  relation: Relation<typeof tablesStructure>,
  option: Omit<GlobalOptions, "tablesStructure" | "relation"> = {}
) {
  const database = new defineDatabase<DatabaseOptions<typeof tablesStructure>>(
    OrmLoader,
    {
      tablesStructure,
      relation,
      ...option,
    }
  );
  return {
    connect: database.connect,
    Database: database.database,
  };
}
