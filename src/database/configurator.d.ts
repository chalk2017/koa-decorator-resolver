import { Options } from "sequelize/dist";
// 标准配置转换
export type Transfor<T> = (configDetail: any, env?: { [key: string]: any }) => T;
export type StandardConfigType<T, D extends string> = {
    driver: keyof D,
    options: {
        [k: string]: T
    }
}
export type StandardReturnType = any[];
export function standardTransfor<T>(configDetail: StandardConfigType<T, 'mysql' | 'postgres' | any>): StandardReturnType
/**
 * 读取数据库配置文件
 * @param {env, transfor} options 
 * @returns 
 */
export function loadConfig<T>(options?: {
    env?: boolean | string,
    transfor?: (configDetail: any, env?: { [key: string]: any }) => T
}): T;

