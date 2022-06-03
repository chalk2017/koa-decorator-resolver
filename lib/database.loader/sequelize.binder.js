"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineTables = void 0;
const baseDefined_1 = require("../database/baseDefined");
const sequelize_loader_1 = require("./sequelize.loader");
function defineTables(tablesStructure, relation, option) {
    const database = new baseDefined_1.DefineDatabase(sequelize_loader_1.OrmLoader, {
        tablesStructure,
        relation,
        ...option || {},
    });
    return {
        connect: database.connect,
        Database: database.database,
    };
}
exports.defineTables = defineTables;
//# sourceMappingURL=sequelize.binder.js.map