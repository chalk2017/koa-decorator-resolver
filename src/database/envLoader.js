// 读取数据库配置文件
export const loadConfig = (connConf) => {
    // parsed: /项目根目录/.env
    // .env: DB_DRIVER=sqlite
    if (connConf) {
        if (connConf.driver === "sqlite") {
            return [
                {
                    dialect: "sqlite",
                    storage: connConf.path,
                },
            ];
        } else if (connConf.driver === "mysql") {
            return [
                connConf.database,
                connConf.username,
                connConf.password,
                {
                    host: connConf.host,
                    port: connConf.port,
                    dialect: "mysql",
                },
            ];
        } else if (connConf.driver === "postgres") {
            return [
                connConf.database,
                connConf.username,
                connConf.password,
                {
                    host: connConf.host,
                    port: connConf.port,
                    dialect: "postgres",
                },
            ];
        } else {
            return [];
        }
    }
    const { parsed } = require("dotenv").config();
    if (parsed.DB_DRIVER === "sqlite") {
        const _connConf = require(require("path").resolve("db.sqlite.js"));
        return [
            {
                dialect: "sqlite",
                storage: _connConf.path,
            },
        ];
    } else if (parsed.DB_DRIVER === "mysql") {
        const _connConf = require(require("path").resolve("db.mysql.js"));
        return [
            _connConf.database,
            _connConf.username,
            _connConf.password,
            {
                host: _connConf.host,
                port: _connConf.port,
                dialect: "mysql",
            },
        ];
    } else if (parsed.DB_DRIVER === "postgres") {
        const _connConf = require(require("path").resolve("db.postgres.js"));
        return [
            _connConf.database,
            _connConf.username,
            _connConf.password,
            {
                host: _connConf.host,
                port: _connConf.port,
                dialect: "postgres",
            },
        ];
    } else {
        return [];
    }
};