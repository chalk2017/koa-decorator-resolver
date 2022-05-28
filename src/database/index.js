/**
 * 数据库反射
 */
export class defineTables {
  tablesStructure; // 表构造
  relation; // 关系映射钩子函数
  connConf; // 连接配置
  sequelize; // orm实例
  constructor(tablesStructure, relation) {
    this.tablesStructure = tablesStructure;
    this.relation = relation || (() => "");
    this.connConf = params?.connConf;
    this.sequelize = params?.sequelize;
  }
  // 定义表
  declareTables(sequelize, cacheTabs, transition) {
    const _this = this;
    const commonOpt = {
      freezeTableName: true,
      timestamps: false,
    };
    let tables = {};
    if (cacheTabs && cacheTabs.length > 0) {
      // 按需初始化表
      cacheTabs.forEach((tableName) => {
        const model = (
          _this.tablesStructure
        )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
        if (transition) {
          tables[tableName] = _this.useTransaction(model, transition);
        } else {
          tables[tableName] = model;
        }
      });
    } else {
      Object.keys(_this.tablesStructure).forEach((tableName) => {
        const model = (
          _this.tablesStructure
        )[tableName]({ s: sequelize, o: commonOpt, t: tableName });
        if (transition) {
          tables[tableName] = _this.useTransaction(model, transition);
        } else {
          tables[tableName] = model;
        }
      });
    }
    _this.relation(tables);
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
  // 装饰器
  Database(option) {
    const _this = this;
    const decoratorFunc = (target, propertyKey, { configurable, enumerable, value, writable }) => {
      const func = async (...args) => {
        const autoClose = option?.autoClose ?? true; // 自动关闭，默认true
        const useTransaction = option?.useTransaction ?? false; // 是否使用事物，默认false
        let res;
        // console.log(option?.useOrm);
        // if (option?.useOrm) {
        const sequelize = await ormConnectionCreate(_this.sequelize)(
          _this.connConf
        );
        let transaction = null;
        if (useTransaction) {
          transaction = await sequelize.transaction();
        }
        const tables = _this.declareTables(
          sequelize,
          option.tables,
          transaction
        );
        target.db = { sequelize, tables, transaction };
        try {
          res = await (value).apply(target, args);
          if (useTransaction) {
            transaction.commit();
          }
        } catch (err) {
          if (useTransaction) {
            transaction.rollback();
          }
          throw err;
        }
        // res = await (value as Function).apply(target, args);
        if (autoClose && !useTransaction) {
          await sequelize.close();
        }
        // }
        return res;
      };
      return { configurable, enumerable, value: func, writable };
    };
    return decoratorFunc;
  }
  // 废弃装饰器
  Sqlite = this.Database;
}

// 创建orm通用连接
export const ormConnectionCreate =
  (_Sequelize) => async (connConf) => {
    try {
      const commonConfig = loadConfig(connConf) || {};
      const sequelize = new Sequelize(...commonConfig);
      return sequelize;
    } catch (err) {
      new Error("DB connect error!");
    }
  };
