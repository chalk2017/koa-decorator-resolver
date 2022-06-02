import { DefineDatabase } from "../database/baseDefined";
import { TablesStructure, Relation, DatabaseOptions, GlobalOptions } from "./sequelize.loader";
export declare function defineTables<T extends TablesStructure = TablesStructure>(tablesStructure: T, relation: Relation<typeof tablesStructure>, option?: Omit<GlobalOptions, "tablesStructure" | "relation">): {
    connect: DefineDatabase<DatabaseOptions<typeof tablesStructure>>["connect"];
    Database: DefineDatabase<DatabaseOptions<typeof tablesStructure>>["database"];
};
