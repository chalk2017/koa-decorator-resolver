/**
 * 数据库反射
 */
export type TargetType = any;
export class defineDatabase<ConnectOptions, DatabaseOptions> {
  constructor(ormLoader: OrmBaseLoaderConstructor<ConnectOptions, DatabaseOptions>, options?: { [key: string]: any });
  // 数据库连接
  connect(options?: ConnectOptions): Promise<void>
  // 装饰器
  database(options?: DatabaseOptions):
    (target: TargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
}
// 自定义OrmBaseLoader接口
export interface OrmBaseLoader<ConnectOptions, DatabaseOptions> {
  connect(options?: ConnectOptions): Promise<any>;
  onCallBefore(target: TargetType, funcName: string, options: DatabaseOptions): Promise<any>;
  onCallAfter(target: TargetType, funcName: string, options: DatabaseOptions): Promise<any>;
  onCallError(target: TargetType, funcName: string, options: DatabaseOptions, error: any): Promise<any>;
}
// 调用OrmBaseLoader接口的class类型
export interface OrmBaseLoaderConstructor<ConnectOptions, DatabaseOptions> {
  new(...args: any[]): OrmBaseLoader<ConnectOptions, DatabaseOptions>;
}
