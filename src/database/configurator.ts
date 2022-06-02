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
/**
 * 读取数据库配置文件
 * @param {env, transfor} options 
 * @returns 
 */
 export function loadConfig<T>(options?: {
    env?: boolean | string;
    transfor?: Transfor<any, any, T>;
  }): T {
    const { env, transfor } = options || {};
    /**
     * env 是否读取"/项目根目录/.env"文件
     * transfor 用于配置转换成参数
     */
    let configFile = 'db.config.js';
    let envArgs = {} as any;
    // 以.env文件的DB_DRIVER参数做为文件名
    if (env) {
        const { parsed } = require("dotenv").config();
        envArgs = parsed;
        configFile = `db.${envArgs.DB_DRIVER}.js`;
    }
    const configDetail = require(require("path").resolve(configFile));
    if (transfor) {
        return transfor(configDetail, envArgs);
    } else {
        return configDetail;
    }
}

// 标准配置转换
export function standardTransfor<T = StandardReturnType>(
    configDetail: StandardConfigType<
      T,
      "mysql" | "postgres" | "mariadb" | "mssql" | string
    >
  ): T {
    const currDriver = configDetail.driver;
    const options = configDetail.options;
    for (const driver in options) {
        if (driver === currDriver) {
            return options[driver]
        }
    }
    return [] as any;
}
