import { Sequelize, ModelCtor, Model, Transaction, PoolOptions, ModelAttributes, ModelOptions } from "sequelize";
import { Transfor } from "../database/configurator";
import { OrmBaseLoader, OrmInjectTargetType } from "../database/baseDefined";
export declare type ExtractResult<T, U> = T extends keyof U ? U[T] : never;
export declare type Combine<T, K = {
    [key: string]: any;
}> = {
    [P in keyof T]: T[P];
} & K;
export declare type CombineAny<T, K = {
    [key: string]: any;
}> = {
    [P in keyof T]: any;
} & K;
export declare type CombineColumnModel<T> = CombineAny<T, Model<any, any>>;
export declare type TablesModelType<T extends TablesStructure = TablesStructure> = {
    [P in keyof T]: ReturnType<T[P]> extends any[] ? ModelCtor<CombineColumnModel<ReturnType<T[P]>[0]>> : ModelCtor<Model<any, any>>;
};
export interface OrmInterface<T extends TablesStructure = TablesStructure> extends OrmInjectTargetType {
    db: DB<T>;
}
export declare class OrmSequelize<T extends TablesStructure = TablesStructure> implements OrmInterface {
    db: DB<T>;
}
export declare type DefineModel<AT = any> = (model: ModelAttributes<Model<any, any>, AT>, option?: ModelOptions<Model<any, any>>) => ModelCtor<Model<any, any>>;
export declare type TablesStructureProps = {
    s: Sequelize;
    t: string;
    o: {
        [key: string]: any;
    };
};
export declare type TablesStructure = {
    [tableName: string]: (define: DefineModel, i: TablesStructureProps) => ModelCtor<Model<any, any>> | any[];
};
export declare type Relation<T extends TablesStructure = TablesStructure> = (tableModels: TablesModelType<T>) => void;
export declare type DatabaseOptions<T extends TablesStructure = TablesStructure> = {
    /** @deprecated use useOrm */
    useOrm?: boolean;
    tables?: Array<keyof T>;
    relation?: Relation<T>;
    useTransaction?: boolean;
};
export declare type GlobalOptions = {
    tablesStructure?: TablesStructure;
    relation?: Relation;
    useBaseConfig?: boolean;
    useAlwaysConnection?: boolean;
    useTransaction?: boolean;
    sequelizeArgs?: any[];
};
export declare const DefaultOptions: {
    useBaseConfig: boolean;
    useTransaction: boolean;
    useAlwaysConnection: boolean;
    connectionKey: string;
};
export declare type DB<T extends TablesStructure = TablesStructure> = {
    sequelize: Sequelize;
    transaction: Transaction;
    tables: TablesModelType<T>;
};
export declare class OrmLoader implements OrmBaseLoader<DatabaseOptions> {
    connectionPool: {
        [key: string | number | symbol]: Pick<DB, "sequelize" | "transaction">;
    };
    distroyConnect(key: string | symbol | number): void;
    options: GlobalOptions;
    connect(connectOptions?: {
        key?: string | symbol;
        args?: any[];
    }): Promise<void>;
    onCallBefore(target: OrmInterface, funcName: string, options: DatabaseOptions): Promise<{
        connectionKey: string | symbol;
        transaction?: Transaction;
    }>;
    onCallAfter(target: OrmInterface, funcName: string, options: DatabaseOptions, callBeforeResult: {
        connectionKey: string | symbol;
        transaction?: Transaction;
    }): Promise<void>;
    onCallError(target: OrmInterface, funcName: string, options: DatabaseOptions, callBeforeResult: {
        connectionKey: string | symbol;
        transaction?: Transaction;
    } | undefined, callAfterResult: any, error: any): Promise<void>;
    declareTables(sequelize: Sequelize, transition: Transaction, cacheTabs: string[], relation: Relation): TablesModelType;
}
export declare type RewriteModelCtor<T extends keyof ModelCtor<Model<any, any>>> = Pick<ModelCtor<Model<any, any>>, T>;
export declare type RewriteModelProps = RewriteModelCtor<"create" | "update" | "destroy" | "bulkCreate" | "findAll" | "findOne" | "max" | "min" | "sum" | "count">;
export declare function injectTransaction(model: ModelCtor<Model<any, any>>, transaction: Transaction): RewriteModelProps;
export declare type RewriteModelKeys = keyof RewriteModelProps;
export declare function useTransaction(model: ModelCtor<Model<any, any>>, transaction: Transaction): RewriteModelProps & ModelCtor<Model<any, any>>;
/** @deprecated use BaseConfigType */
export declare type BaseConfigType = {
    database?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    path?: string;
    pool?: PoolOptions;
};
/** @deprecated use baseTransfor */
export declare const baseTransfor: Transfor<BaseConfigType, {
    DB_DRIVER: "mysql" | "postgres" | "sqlite";
}>;
