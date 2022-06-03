import { tablesStructure } from "./database";
import { OrmSequelize } from "../index";
/**
 * 测试模块
 */
export declare class DemoServiceAlpha extends OrmSequelize<typeof tablesStructure> {
    test1(): Promise<import("../index").CombineColumnModel<{
        USERID: {
            type: import("sequelize/dist").StringDataType;
            primaryKey: boolean;
        };
        USERNAME: {
            type: import("sequelize/dist").StringDataType;
            primaryKey: boolean;
        };
        PASSWORD: import("sequelize/dist").StringDataType;
    }>>;
}
export declare class DemoServiceBeta {
    test1(): Promise<void>;
    test2(): Promise<void>;
}
