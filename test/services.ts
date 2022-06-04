import { Database, tablesStructure } from "./database";
import { OrmSequelize, TablesModelType } from "../";
const relation = (tables: TablesModelType<typeof tablesStructure>) => {
  tables.USER.hasOne(tables.USER);
};
/**
 * 测试模块
 */
export class DemoServiceAlpha extends OrmSequelize<typeof tablesStructure> {
  @Database({ tables: [], useTransaction: false, relation })
  async test1() {
    const res = await this.db.tables.USER.findOne();
    return res;
  }
}

export class DemoServiceBeta {
  async test1() {}

  async test2() {}
}
