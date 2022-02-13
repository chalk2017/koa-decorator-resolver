import { Sequelize, ModelCtor, Model, Transaction } from 'sequelize'
type TablesStructure = { [tableName: string]: (s: Sequelize, o: { [key: string]: any }, t: string) => ModelCtor<Model<any, any>> }
export interface DefineTables {
    declareTables: (sequelize: Sequelize, cacheTabs: Array<any>, transition?: Transaction) => Record<keyof TablesStructure, ModelCtor<Model<any, any>>>;
}
// 装饰器
interface Option<T> {
    useOrm?: boolean,
    autoClose?: boolean,
    useTransaction?: boolean,
    tables?: Array<keyof T>
}
export class defineTables<T> {
    constructor(tablesStructure, relation);
    // 定义表
    declareTables(sequelize: Sequelize, cacheTabs: Array<any>, transition?: Transaction): Record<keyof TablesStructure, ModelCtor<Model<any, any>>>;
    // 装饰器
    Sqlite(option?: Option<T>): (target: any, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
}
// restful请求装饰器
export function Get(url): (target: any, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
export function Post(url): (target: any, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
// 自动注入
/**
 * service方法参数：
 * arg1：页面传输参数
 * arg2：插件参数 + 页面传输参数
 * arg3：请求交互的ctx对象
 */
export type PluginConfig = {
    [injectorName: string]: {
        method?: 'get' | 'post',
        before?: {
            plugin: (ctx: any, option?: any) => any,
            replaceProps: boolean,
        },
        after?: {
            plugin: (res: any, ctx: any, option?: any) => any,
            replaceProps: boolean,
        }
    }
}
// server 插件注入
export function servInjector(target: any, funcName: string, config: PluginConfig): ['post' | 'get', (ctx: any) => any];
// 路由绑定方法
export function routeBinder(router: any, serviceModules: { [className: string]: any }, config: PluginConfig): { [controller: string]: (ctx: any) => any };
// restful 绑定方法
export function restfulBinder(router: any, serviceModules: { [className: string]: any }): { [controller: string]: (ctx: any) => any };
// 装饰器类型声明
export type Injector<T> = (option?: T) => any;
// 装饰器构造器
export function injectorBuilder(injectName: string, callbacks?: { onCreate, onBefore, onAfter }): (option?: any) => (target: any, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
