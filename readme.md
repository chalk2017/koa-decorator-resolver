# koa-decorator-resolver :zap:

> **文档对应版本：v1.1.x**

[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver) [![SQL@Support:sqlite|postgres|mysql](https://img.shields.io/badge/SQL%40Support-sqlite%20%7C%20postgres%20%7C%20mysql-lightgrey)](https://github.com/chalk2017/koa-decorator-resolver) 
[![sequelize:^6.x.x](https://img.shields.io/badge/sequelize@Support-6-blue)](https://www.sequelize.com.cn/)

**这是一个可以在koa框架中使用装饰器的解决方案**

------------

[![英文|English](https://img.shields.io/badge/%E8%8B%B1%E6%96%87-English-blue)](#)

------------

> **支持的依赖版本** 

[![node:^14.x.x](https://img.shields.io/badge/node-14.x.x-orange)](https://nodejs.org/en/)
[![koa:^2.x.x](https://img.shields.io/badge/koa-2.x.x-orange)](https://koa.bootcss.com/)
[![koa-router:^2.x.x](https://img.shields.io/badge/koa--router-7.x.x-orange)](https://wohugb.gitbooks.io/koajs/content/route/koa-router.html)
[![sequelize:^6.x.x](https://img.shields.io/badge/sequelize-6.x.x-orange)](https://www.sequelize.com.cn/)

```json
// 测试基于以下版本
{
    "sequelize": "6.12.0-alpha.1",
    "koa": "^2.6.2",
    "koa-router": "^7.4.0",
    "node": "^14.19.1",
    "sqlite": "^4.0.23",
    "sqlite3": "^5.0.2",
    "mysql2": "^2.3.3",
    "pg-hstore": "^2.3.4",
    "pg" : "^7.18.2"
}
```

------------
- ## 目录
- [安装](#安装)
- [默认请求](#默认请求)
  - [使用方法](#使用方法)
  - [定义插件](#定义插件)
- [使用数据库](#使用数据库)
  - [配置数据库](#配置数据库)
    - [创建数据库连接实例](#创建数据库连接实例)
    - [定义表模型](#定义表模型)
    - [定义装饰器](#定义装饰器)
    - [调用Sequelize数据库关系模型库](#调用Sequelize数据库关系模型库)
    - [开启事务](#开启事务)
  - [文件配置数据库、mysql和postgres方言配置](#文件配置数据库、mysql和postgres方言配置)
- [传统Restful请求](#传统Restful请求)
  - [使用方法](#使用方法)

### 安装
```
# 安装依赖
npm install koa-decorator-resolve

# 如果要用到sqlite数据库，则需要安装驱动，如下：
npm install sqlite@4.x.x sqlite3@5.x.x

# 如果要用到mysql数据库，则需要安装驱动，如下：
npm install mysql2@2.x.x
```
-----

**数据库支持程度**
> 依赖于Sequelize对数据库的支持
```
sqlite ｜ mysql ｜ postgres(不支持池和ssl)
```
### 默认请求
> 不需要定义restful，单纯的通过定义类和函数的方式自动解析成restful请求，请求的Url格式是“类名/函数名”，默认解析成的是Post，如果想要解析成Get或其他请求可以通过自定义插件的方式生成相应装饰器来解决。
#### 使用方法
- **文件: index.ts**
```typescript
// 这是koa工程的入口文件
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { routeBinder } from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
const router = new Router();
// 把模块注册在路由上
routeBinder(router,serviceModules);
app.use(router.routes());
app.listen(8080, () => {
    console.log('server start on 8080');
});
```
- **文件: serviceModules.ts**
```typescript
// 这是注册在路由上的模块列表
export class serviceModule1 {
    func1(data){
        return {name:data.name + ' func1',msg:'success'}
    }
    func2(data){
        return {name:data.name + ' func2',msg:'success'}
    }
}
export class serviceModule2 {
    func3(data){
        return {name:data.name + ' func3',msg:'success'}
    }
}
```
- **在前端发送几个请求**
```javascript
    // 通过“类名/函数”就可以发送出去
    axios.post('/serviceModule1/func1',{name:'m1f1'}).then(res=>{
        console.log(res); // 结果 : {name:'m1f1 func1',msg'success'}
    })
    axios.post('/serviceModule2/func3',{name:'m2f3'}).then(res=>{
        console.log(res); // 结果 : {name:'m2f3 func3',msg'success'}
    })
```

#### 定义插件
> 自定义装饰器，用来扩展一些功能
##### 1. 定义装饰器和插件函数
- **文件: plugins.ts**
```typescript
// 这个文件用于配置和注册插件
import {injectorBuilder,Injector} from 'koa-decorator-resolve';
// 定义装饰器
type Option = {value:string}
// Transfer是装饰器名
export const Transfer: Injector<Option> = injectorBuilder('Transfer');
// 配置装饰器
export const config = {
    Transfer: { // Transfer是装饰器名，一定要与injectorBuilder里参数中的名字一致
        method: 'get', // 被装饰的方法反射的restful类型，默认是post，如果一个方法有多个装饰插件，则以第一个为主
        before: { // 被装饰方法执行前，所执行的钩子方法
            plugin: (ctx: any, option?: Option) => {
                return {'transfer-before':option.value};
            },
            replaceProps: true, // 是否把钩子方法的返回值替换给被装饰方法的第一个参数
        },
        after: { //  被装饰方法执行结束后，所执行的钩子方法
            plugin: (res: any, ctx: any, option?: Option) => {
                return {'transfer-after':res}
            },
            replaceProps: true, // 是否把钩子方法的返回值替换给请求返回值的body
        },
        intercept: (func: (...args: ServiceFunctionArgs) => any, args: ServiceFunctionArgs, option?: any) => {
            // 拦截器钩子
            return func(...args)
        }
    }
}
```
##### 2. 注册插件
- **文件: index.ts**
```typescript
// the entry of project
import * as Koa from 'koa';
import * as Router from 'koa-router';
import {routeBinder,PluginConfig} from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
import {config} from './plugins'; // 上一步定义的插件配置
const router = new Router();
// 通过注册路由方法的第三个参数注册插件
routeBinder(router,serviceModules,config as PluginConfig);
app.use(router.routes());
app.listen(8080, () => {
    console.log('server start on 8080');
});
```
##### 3. 使用装饰器

- **文件: serviceModules.ts**
```typescript
// the restful modules
import {Transfer} from './plugins';
export class serviceModule {
    // 用定义的装饰器直接注解方法
    @Transfer({value:123})
    func(data){
        // 根据上面的逻辑，data的值 : {'transfer-before':123}
        return 456
    }
    // 根据上面的逻辑，请求response的值 : {'transfer-after':456}
}
```

### 使用数据库
> 通过装饰器注入数据库实例
#### 配置数据库

##### 创建数据库连接实例
> 首先要创建数据库连接
- **文件: initTables.ts**
```typescript
import {defineTables} from 'koa-decorator-resolve';
import {TablesType,tablesStructure,relationCallback} from './declareTables';
export const tablesInstance = new defineTables<TablesType>(tablesStructure, relationCallback, {
    connConf: {
        driver: 'sqlite',
        path: require('path').resolve('db/database_file.db')
    }
});
```
```json
// 以下是mysql和postgres的配置方法
{
    "connConf" : {
        "database": "test_db",
        "username": "test_user",
        "password": "test_pw",
        "host": "localhost",
        "port": 2001
    }
}
```
##### 定义表模型
> 创建数据库表模型，相关技术可以去了解sequelize库
- **文件: declareTables.ts**
```typescript
// 引入sequelize的类型
import { STRING, INTEGER, BIGINT, DATE, TIME, DATEONLY, BOOLEAN, FLOAT, DOUBLE } from 'sequelize';
// 以下是表模型的构造器
export const tablesStructure = {
    ACCESS: ({sequelize,tableName,option}) => sequelize.define(tableName, {
        id: {
          type: BIGINT,
          primaryKey: true,
        },
        user_name: STRING(20),
        role: STRING(4),
        access: INTEGER,
        begin_date: DATE,
        end_date: DATE,
    }, option)
}
export const TablesType = Record<keyof typeof tablesStructure, any>;
// 表与表的关系模型可以定义在这里
export const relationCallback = (tableModels) => {
    const accessModel = tableModels['ACCESS'];
    // ...
}
```
##### 定义装饰器
- **文件: declareDecorator.ts**
```typescript
import {tablesInstance} from './initTables';
// 通过实例获取装饰器
export const Sqlite = tablesInstance.Database.bind(tablesInstance) as typeof tablesInstance.Database;
```
##### 调用Sequelize数据库关系模型库
> 装饰器注入DB实例
```typescript
// the restful modules
import {OrmConnectionType} from 'koa-decorator-resolve';
import {Sqlite} from './declareDecorator';
export class serviceModule {
    private db: OrmConnectionType;
    @Sqlite({
        useOrm:true,
        tables:['ACCESS'] // 如果表非常多，可以通过这种方式按需加载表模型，如果没有这个参数，则全部模型都加载
    })
    async func(data){
        return await this.db.tables.ACCESS.findAll() // 通过表模型直接操作数据库，参照Sequelize
    }
}
```
##### 开启事务
> 事务中，成功commit，异常rollback
```typescript
// the restful modules
import {OrmConnectionType} from 'koa-decorator-resolve';
import {Sqlite} from './declareDecorator';
export class serviceModule {
    private db: OrmConnectionType;
    @Sqlite({
        useOrm:true,
        tables:['ACCESS'],
        useTransaction:true // 开启事务
    })
    async func(data){
        return await this.db.tables.ACCESS.findAll()
    }
}
```

#### 文件配置数据库、mysql和postgres方言配置
> 通过配置文件配置数据库
```
# 在工程根目录下的.env文件中配置当前连接到哪个数据库，每个数据库有单独的配置文件，支持热替换（服务运行当中替换数据库）
[base] -- .env
     | -- db.sqlite.js
     | -- db.mysql.js
     | -- db.postgres.js

# 以下是.env文件的格式
--------------------------------
| # if you want to use sqlite
| DB_DRIVER=sqlite
| # if you want to use mysql
| # DB_DRIVER=mysql
| # if you want to use postgres
| # DB_DRIVER=postgres
--------------------------------
```
```javascript
// db.sqlite.js文件的配置方法
module.exports = {
    path: '/etc/test.db'
}
// db.mysql.js 和 db.postgres.js的配置方法
module.exports = {
    database: 'test_db',
    username: 'test_user',
    password: 'test_pw',
    host: 'localhost',
    port: 2001
}
```

### 传统Restful请求
> 你也可以直接用Get和Post装饰器，来装饰方法
**注意：这种方式不支持插件，但会更自由**
#### 使用方法
- **文件: index.ts**
```typescript
// the entry of project
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { restfulBinder } from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
const router = new Router();
// 通过restfulBinder来注册路由
restfulBinder(router,serviceModules);
app.use(router.routes());
app.listen(8080, () => {
    console.log('server start on 8080');
});
```
- **文件: serviceModules.ts**
```typescript
import {Get,Post} from 'koa-decorator-resolve';
// 这是restful请求，如需要操作数据库也可以同时用数据库装饰器
export class serviceModule {
    @Get('/api/hello/:user')
    func1(data, ctx){
        return {user: data.user}
    }
    @Post('/api/hello2')
    func2(data, ctx){
        return {user: data.user}
    }
}
```