/**
 * 数据库反射
 */
export type OrmInjectTargetType = {
  [key: string]: any;
};
export class defineDatabase<DatabaseOptions = any> {
  constructor(
    ormLoader: OrmBaseLoaderConstructor<DatabaseOptions>,
    options?: { [key: string]: any }
  );
  // 数据库连接
  connect(...args: any[]): Promise<void>;
  // 装饰器
  database(
    options?: DatabaseOptions
  ): (
    target: OrmInjectTargetType,
    propertyKey: string,
    props: PropertyDescriptor
  ) => PropertyDescriptor;
}
// 自定义OrmBaseLoader接口
type a = Record<any, any>;
export interface OrmBaseLoader<DatabaseOptions = any> {
  connect(...args: any[]): Promise<any>;
  onCallBefore(
    target: OrmInjectTargetType,
    funcName: string,
    options: DatabaseOptions
  ): Promise<any>;
  onCallAfter(
    target: OrmInjectTargetType,
    funcName: string,
    options: DatabaseOptions
  ): Promise<any>;
  onCallError(
    target: OrmInjectTargetType,
    funcName: string,
    options: DatabaseOptions,
    error: any
  ): Promise<any>;
}
// 调用OrmBaseLoader接口的class类型
export interface OrmBaseLoaderConstructor<DatabaseOptions = any> {
  new (...args: any[]): OrmBaseLoader<DatabaseOptions>;
}
