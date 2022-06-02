/**
 * 数据库反射
 */
export declare type OrmInjectTargetType = {
    [key: string]: any;
};
export interface OrmBaseLoader<DatabaseOptions = any> {
    connect(...args: any[]): Promise<any>;
    onCallBefore(target: OrmInjectTargetType, funcName: string, options: DatabaseOptions): Promise<any>;
    onCallAfter(target: OrmInjectTargetType, funcName: string, options: DatabaseOptions): Promise<any>;
    onCallError(target: OrmInjectTargetType, funcName: string, options: DatabaseOptions, error: any): Promise<any>;
}
export interface OrmBaseLoaderConstructor<DatabaseOptions = any> {
    new (...args: any[]): OrmBaseLoader<DatabaseOptions>;
}
export declare class DefineDatabase<DatabaseOptions = any> {
    orm: OrmBaseLoader;
    options: {};
    constructor(ormLoader: OrmBaseLoaderConstructor<DatabaseOptions>, options?: {
        [key: string]: any;
    });
    connect(...args: any[]): Promise<void>;
    database(options?: DatabaseOptions): (target: OrmInjectTargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
}
