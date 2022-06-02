/**
 * 数据库反射
 */
export type OrmInjectTargetType = {
  [key: string]: any;
};
// 自定义OrmBaseLoader接口
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
export class defineDatabase<DatabaseOptions = any> {
  // ORM
  orm: OrmBaseLoader = {
    onCallBefore: async () => "",
    onCallAfter: async () => "",
    onCallError: async () => "",
    connect: async () => "",
  };
  // 全局参数
  options = {};
  // 初始化
  constructor(
    ormLoader: OrmBaseLoaderConstructor<DatabaseOptions>,
    options?: { [key: string]: any }
  ) {
    // 加载参数
    this.options = options || {};
    // 加载orm
    this.orm = new ormLoader(options);
    // 绑定option参数，不允许修改orm.option但可以修改orm.option下的成员
    Object.defineProperty(this.orm, "options", {
      get() {
        return this.options;
      },
    });
  }
  // 数据库连接
  async connect(...args: any[]): Promise<void> {
    await this.orm?.connect(...args);
  }
  // 装饰器
  database(
    options?: DatabaseOptions
  ): (
    target: OrmInjectTargetType,
    propertyKey: string,
    props: PropertyDescriptor
  ) => PropertyDescriptor {
    const _this = this;
    const decoratorFunc = (
      target,
      propertyKey,
      { configurable, enumerable, value, writable }
    ) => {
      const func = async (...args) => {
        let res = undefined;
        try {
          await _this.orm.onCallBefore.call(
            _this.orm,
            target,
            propertyKey,
            options
          );
          res = await value.apply(target, args);
          await _this.orm.onCallAfter.call(
            _this.orm,
            target,
            propertyKey,
            options
          );
        } catch (err) {
          await _this.orm.onCallError.call(
            _this.orm,
            target,
            propertyKey,
            options,
            err
          );
          throw err;
        }
        return res;
      };
      return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
  }
}
