import * as Koa from "koa";
import * as Router from "koa-router";
import { routeBinder } from "../";
import * as services from "./services";
import { config } from "./plugins";
const router = new Router();
routeBinder(router, services, config);
const app = new Koa();
app.use(router.routes());
app.listen(8888, () => {
    console.log('listen on 8888')
});
