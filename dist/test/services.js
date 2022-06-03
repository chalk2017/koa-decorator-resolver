"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoServiceBeta = exports.DemoServiceAlpha = void 0;
const database_1 = require("./database");
const index_1 = require("../index");
/**
 * 测试模块
 */
class DemoServiceAlpha extends index_1.OrmSequelize {
    async test1() {
        const res = await this.db.tables.USER.findOne();
        return res;
    }
}
__decorate([
    (0, database_1.Database)({ tables: [], useTransaction: false, relation: (tables) => ({}) }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoServiceAlpha.prototype, "test1", null);
exports.DemoServiceAlpha = DemoServiceAlpha;
class DemoServiceBeta {
    async test1() { }
    async test2() { }
}
exports.DemoServiceBeta = DemoServiceBeta;
//# sourceMappingURL=services.js.map