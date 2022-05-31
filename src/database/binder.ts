import { defineDatabase, OrmBaseLoaderConstructor } from "./baseDefined";
import {
  OrmLoader,
  TablesStructure,
  Relation,
  DatabaseOptions,
} from "./sequelize.loader";

export function ormBinder<T = TablesStructure>(
  tablesStructure: T,
  relation: Relation,
  option = {}
) {
  const database = new defineDatabase<DatabaseOptions<T>>(OrmLoader, {
    tablesStructure,
    relation,
    ...option,
  });
  return {
    connect: database.connect,
    Database: database.database,
  };
}
