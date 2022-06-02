"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const binder_1 = require("src/service/binder");
const services = require("./services");
const router = new Router();
(0, binder_1.routeBinder)(router, services);
const app = new Koa();
app.use(router.routes());
app.listen(8888, () => {
    console.log('listen on 8888');
});
//# sourceMappingURL=index.js.map