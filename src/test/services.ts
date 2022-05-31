import { Database, TablesStructureType } from "./database";
import { InjectOrm } from "../index";
/**
 * 测试模块
 */
export class DemoServiceAlpha extends InjectOrm<TablesStructureType> {
  @Database({ tables: [], useTransaction: false })
  async test1() {
    return await this.db.tables.USER.findAll();
  }
}

export class DemoServiceBeta {
  async test1() {}

  async test2() {}
}