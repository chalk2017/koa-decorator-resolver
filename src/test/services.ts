import { Database, tablesStructure } from "./database";
import { OrmSequelize } from "../index";
/**
 * 测试模块
 */
export class DemoServiceAlpha extends OrmSequelize<typeof tablesStructure> {
  @Database({ tables: [], useTransaction: false, relation: (tables) => ({}) })
  async test1() {
    return await this.db.tables.USER.findAll();
  }
}

export class DemoServiceBeta {
  async test1() {}

  async test2() {}
}
