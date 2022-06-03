export declare type Transfor<ConfigDetailType = any, EnvType = any, ResultType = any> = (configDetail: ConfigDetailType, env?: EnvType) => ResultType;
export declare type StandardConfigType<T, D extends string> = {
    driver: keyof D;
    options: {
        [k: string]: T;
    };
};
export declare type StandardReturnType = any[];
/**
 * 读取数据库配置文件
 * @param {env, transfor} options
 * @returns
 */
export declare function loadConfig<T>(options?: {
    env?: boolean | string;
    transfor?: Transfor<any, any, T>;
}): T;
export declare function standardTransfor<T = StandardReturnType>(configDetail: StandardConfigType<T, "mysql" | "postgres" | "mariadb" | "mssql" | string>): T;
