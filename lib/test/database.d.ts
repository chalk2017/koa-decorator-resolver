export declare const tablesStructure: {
    USER: () => {
        USERID: {
            type: import("sequelize").StringDataType;
            primaryKey: boolean;
        };
        USERNAME: {
            type: import("sequelize").StringDataType;
            primaryKey: boolean;
        };
        PASSWORD: import("sequelize").StringDataType;
    }[];
};
export declare const Database: (options?: import("../index").DatabaseOptions<{
    USER: () => {
        USERID: {
            type: import("sequelize").StringDataType;
            primaryKey: boolean;
        };
        USERNAME: {
            type: import("sequelize").StringDataType;
            primaryKey: boolean;
        };
        PASSWORD: import("sequelize").StringDataType;
    }[];
}>) => (target: import("../index").OrmInjectTargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
export declare const connect: (...args: any[]) => Promise<void>;
