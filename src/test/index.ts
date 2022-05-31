import * as Koa from "koa";
import * as Router from "koa-router";
import { routeBinder } from "src/service/binder";
import * as services from "./services";
const router = new Router();
routeBinder(router, services);
const app = new Koa();
app.use(router.routes());
app.listen(8888, () => {
    console.log('listen on 8888')
});
