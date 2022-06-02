"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardTransfor = exports.loadConfig = void 0;
/**
 * 读取数据库配置文件
 * @param {env, transfor} options
 * @returns
 */
function loadConfig(options) {
    const { env, transfor } = options || {};
    /**
     * env 是否读取"/项目根目录/.env"文件
     * transfor 用于配置转换成参数
     */
    let configFile = 'db.config.js';
    let envArgs = {};
    // 以.env文件的DB_DRIVER参数做为文件名
    if (env) {
        const { parsed } = require("dotenv").config();
        envArgs = parsed;
        configFile = `db.${envArgs.DB_DRIVER}.js`;
    }
    const configDetail = require(require("path").resolve(configFile));
    if (transfor) {
        return transfor(configDetail, envArgs);
    }
    else {
        return configDetail;
    }
}
exports.loadConfig = loadConfig;
// 标准配置转换
function standardTransfor(configDetail) {
    const currDriver = configDetail.driver;
    const options = configDetail.options;
    for (const driver in options) {
        if (driver === currDriver) {
            return options[driver];
        }
    }
    return [];
}
exports.standardTransfor = standardTransfor;
//# sourceMappingURL=configurator.js.map