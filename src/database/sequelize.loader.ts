import { Sequelize, ModelCtor, Model, Transaction, Options } from "sequelize";
import { loadConfig, standardTransfor } from './configurator';
import { TargetType, OrmBaseLoader } from './baseDefined';

/** @deprecated use ConfigType */
export type ConfigType = {

}

export type DBConfigType = {

}

export type DatabaseOptions = {
    tables?: string[],
    useTransaction?: boolean
};
export type GlobalOptions = {
    tablesStructure?: any;
    relation?: any;
    useBaseConfig?: boolean;
}
export const DefaultOptions = {
    useBaseConfig: true,
    useTransaction: false
}
export type DB = { sequelize?: Sequelize, transaction?: Transaction, tables?: any }
export class OrmLoader implements OrmBaseLoader<Options, DatabaseOptions> {
    // db实例
    db: DB = {};
    // 全局选项，外层注入
    options: GlobalOptions;
    // 创建连接
    async connect(sequelizeOptions) {
        const useBaseConfig = this.options.useBaseConfig ?? DefaultOptions.useBaseConfig;
        try {
            const options = sequelizeOptions || loadConfig({
                env: useBaseConfig ? true : false,
                transfor: useBaseConfig ? this.baseTransfor : standardTransfor
            }) || {};
            this.db.sequelize = new Sequelize(...options);
        } catch (err) {
            new Error("DB connect error!");
        }
    }
    // 装饰方法调用前触发
    async onCallBefore(target, funcName, options) {
        const useTransaction = options?.useTransaction ?? DefaultOptions.useTransaction;
        if (useTransaction) {
            this.db.transaction = await this.db.sequelize.transaction();
        }
        this.db.tables = this.declareTables(
            this.db.sequelize,
            options.tables,
            this.db.transaction
        );
        target.db = this.db;
    }
    // 装饰方法调用后触发
    async onCallAfter(target, funcName, options) {
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await this.db.transaction.commit();
        }
        try {
            await this.db.sequelize.close();
        } catch (e) { }
    }
    // 装饰方法调用报错时触发
    async onCallError(target, funcName, options, error) {
        const useTransaction = options?.useTransaction ?? false;
        if (useTransaction) {
            await this.db.transaction.rollback();
        }
        try {
            await this.db.sequelize.close();
        } catch (e) { }
    }

    // 定义表
    declareTables(sequelize, cacheTabs, transition) {
        const commonOpt = {
            freezeTableName: true,
            timestamps: false,
        };
        let tables = {};
        if (cacheTabs && cacheTabs.length > 0) {
            // 按需初始化表
            cacheTabs.forEach((tableName) => {
                const model = (
                    this.options.tablesStructure
                )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
                if (transition) {
                    tables[tableName] = this.useTransaction(model, transition);
                } else {
                    tables[tableName] = model;
                }
            });
        } else {
            Object.keys(this.options.tablesStructure).forEach((tableName) => {
                const model = (
                    this.options.tablesStructure
                )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
                if (transition) {
                    tables[tableName] = this.useTransaction(model, transition);
                } else {
                    tables[tableName] = model;
                }
            });
        }
        this.options.relation(tables);
        return tables;
    }

    // 使用事务
    useTransaction(model, transaction) {
        // 原始方法
        /**
                model.addHook
                model.addScope
                model.afterBulkCreate
                model.afterBulkDestroy
                model.afterBulkSync
                model.afterBulkUpdate
                model.afterCreate
                model.afterDestroy
                model.afterFind
                model.afterSave
                model.afterSync
                model.afterUpdate
                model.afterValidate
                model.aggregate
                model.associations
                model.beforeBulkCreate
                model.beforeBulkDestroy
                model.beforeBulkSync
                model.beforeBulkUpdate
                model.beforeCount
                model.beforeCreate
                model.beforeDestroy
                model.beforeFind
                model.beforeFindAfterExpandIncludeAll
                model.beforeFindAfterOptions
                model.beforeSave
                model.beforeSync
                model.beforeUpdate
                model.beforeValidate
                model.belongsTo
                model.belongsToMany
                model.build
                model.bulkBuild
                model.bulkCreate
                model.count
                model.create
                model.decrement
                model.describe
                model.destroy
                model.drop
                model.findAll
                model.findAndCountAll
                model.findByPk
                model.findCreateFind
                model.findOne
                model.findOrBuild
                model.findOrCreate
                model.getTableName
                model.hasHook
                model.hasHooks
                model.hasMany
                model.hasOne
                model.increment
                model.init
                model.max
                model.min
                model.options
                model.primaryKeyAttribute
                model.primaryKeyAttributes
                model.rawAttributes
                model.removeAttribute
                model.removeHook
                model.restore
                model.schema
                model.scope
                model.sequelize
                model.sum
                model.sync
                model.tableName
                model.truncate
                model.unscoped
                model.update
                model.upsert
             */
        const rewrite = {
            // 重写方法
            create: async (v, o) => await model.create(v, { transaction, ...o }),
            update: async (v, o) => await model.update(v, { transaction, ...o }),
            destroy: async (o) => await model.destroy({ transaction, ...o }),
            bulkCreate: async (vs, o) =>
                await model.bulkCreate(vs, { transaction, ...o }),
            findAll: async (o) => await model.findAll({ transaction, ...o }),
            findOne: async (o) => await model.findOne({ transaction, ...o }),
            max: async (f, o) => await model.max(f, { transaction, ...o }),
            min: async (f, o) => await model.min(f, { transaction, ...o }),
            sum: async (f, o) => await model.sum(f, { transaction, ...o }),
        };
        return new Proxy(model, {
            get(target, propertyKey, receiver) {
                if (rewrite[propertyKey]) {
                    return rewrite[propertyKey];
                } else {
                    return Reflect.get(target, propertyKey, receiver);
                }
            },
        });
    }
    // 简化配置
    baseTransfor(configDetail, env) {
        const driver = env.DB_DRIVER;
        if (driver === "sqlite") {
            return [
                {
                    dialect: "sqlite",
                    storage: configDetail.path,
                },
            ];
        } else if (driver === "mysql") {
            return [
                configDetail.database,
                configDetail.username,
                configDetail.password,
                {
                    host: configDetail.host,
                    port: configDetail.port,
                    dialect: "mysql",
                },
            ];
        } else if (driver === "postgres") {
            return [
                configDetail.database,
                configDetail.username,
                configDetail.password,
                {
                    host: configDetail.host,
                    port: configDetail.port,
                    dialect: "postgres",
                },
            ];
        } else {
            return [];
        }
    };
}
