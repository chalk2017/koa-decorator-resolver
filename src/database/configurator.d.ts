// 标准配置转换
export type Transfor<
  ConfigDetailType = any,
  EnvType = any,
  ResultType = any
> = (configDetail: ConfigDetailType, env?: EnvType) => ResultType;
export type StandardConfigType<T, D extends string> = {
  driver: keyof D;
  options: {
    [k: string]: T;
  };
};
export type StandardReturnType = any[];
export function standardTransfor<T>(
  configDetail: StandardConfigType<
    T,
    "mysql" | "postgres" | "mariadb" | "mssql" | string
  >
): StandardReturnType;
/**
 * 读取数据库配置文件
 * @param {env, transfor} options
 * @returns
 */
export function loadConfig<T>(options?: {
  env?: boolean | string;
  transfor?: Transfor<any, any, T>;
}): T;
