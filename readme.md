# koa-decorator-resolver :zap:

> **这是一个可以在koa框架中使用装饰器的解决方案**

[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver) ![version:1.2.x](https://img.shields.io/badge/version-1.2.x-blue)

------------

- ### 支持的依赖版本 

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
- [方法、参数一览](#方法、参数一览)

### 安装
```
# 安装依赖
npm install koa-decorator-resolve 
```

-----

**数据库支持**
```
# 如果要用到mysql数据库，则需要安装驱动，如下：
npm install mysql2@2.x.x

# 如果要用到postgres数据库，则需要安装驱动，如下：
npm install pg@7.x.x pg-hstore@2.x.x

# 如果要用到sqlite数据库，则需要安装驱动，如下：
npm install sqlite@4.x.x sqlite3@5.x.x
```
> 完全依赖于Sequelize对数据库的支持，详细参照：[https://www.sequelize.com.cn/](https://www.sequelize.com.cn/)


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
import {injectorBuilder,Injector,ModuleFuncArgsType} from 'koa-decorator-resolve';
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
        intercept: (func: (...args: ModuleFuncArgsType) => any, args: ModuleFuncArgsType, option?: Option) => {
            // 拦截器钩子，如果多个装饰器定义了拦截器钩子，只生效第一个
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
import {routeBinder} from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
import {config} from './plugins'; // 上一步定义的插件配置
const router = new Router();
// 通过注册路由方法的第三个参数注册插件
routeBinder(router,serviceModules,config);
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
// 引入sequelize的类型
import { STRING, INTEGER, BIGINT, DATE, TIME, DATEONLY, BOOLEAN, FLOAT, DOUBLE } from 'sequelize';
// 引入定义函数
import {defineTables} from 'koa-decorator-resolve';
// 以下是表模型的构造器
export const tablesStructure = {
    ACCESS:[{
        id: {
          type: BIGINT,
          primaryKey: true,
        },
        user_name: STRING(20),
        role: STRING(4),
        access: INTEGER,
        begin_date: DATE,
        end_date: DATE,
    }, {version: true}],
    USER:[{
        user_id: {
          type: BIGINT,
          primaryKey: true,
        },
        user_name: STRING(20),
        password: STRING(20)
    }, {version: true}],
}
// 表与表的关系模型可以定义在这里，基于sequelize的关系模型定义方式
export const relationCallback = (tables) => {
    tables.ACCESS.hasOne(tables.USER);
    // ...
}
export const {
    Database, // 装饰器
    connect // 连接函数（下面参数useAlwaysConnection=true的场合需要在入口手动调用这个函数来创建连接）
} = new defineTables(tablesStructure, relationCallback, {
    // 使用长连接，短连接是每次执行方法的时候连接一次，执行完释放连接
    useAlwaysConnection: false, // 默认false
    // // 是否使用基础配置文件(基础配置方式请查看文档最后的说明)
    // useBaseConfig: false, // 默认true
    // 直接传入sequelize参数， 数组内为实例化sequelize的参数，详细参数用法，请参照sequelize库
    sequelizeArgs: [
      "default_db",
      "root",
      "root",
      {
        host: "localhost",
        port: 3306,
        dialect: "mysql",
      },
    ]
});
```

##### 调用Sequelize数据库关系模型库
> 装饰器注入DB实例
```typescript
// the restful modules
import {OrmSequelize} from 'koa-decorator-resolve';
import {Database,tablesStructure} from './initTables';
export class serviceModule extends OrmSequelize<typeof tablesStructure> {
    @Database({
        tables: ['ACCESS','USER'],
        relation: (tables) => {
            // 配合tables用于动态表关联
        }
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
import {OrmSequelize} from 'koa-decorator-resolve';
import {Database,tablesStructure} from './initTables';
export class serviceModule extends OrmSequelize<typeof tablesStructure> {
    @Sqlite({
        useTransaction:true // 开启事务
    })
    async func(data){
        return await this.db.tables.ACCESS.findAll()
    }
}
```

#### 文件配置数据库

> 通过配置文件配置数据库
1. useBaseConfig = true 使用基本配置
```typescript
import {defineTables} from 'koa-decorator-resover';
export const {Database,connect} = new defineTables(tablesStructure, relationCallback, {
    // 是否使用基础配置文件
    useBaseConfig: true, // 默认true
    // 注意： sequelizeArgs参数不能添加，否则会优先于sequelizeArgs对数据库的配置
});
```

```
# 在工程根目录下的.env文件中配置当前连接到哪个数据库，每个数据库有单独的配置文件，短连接的时候支持热替换（服务运行当中替换数据库）
[base] -- .env
     | -- db.mysql.js
     | -- db.postgres.js

# 以下是.env文件的格式
--------------------------------
| # 此时加载根目录下的db.mysql.js, 如果DB_DRIVER=postgres则会加载根目录下的db.postgres.js文件
| # DB_DRIVER=mysql
--------------------------------
```

```javascript
// db.mysql.js 和 db.postgres.js的配置方法
module.exports = {
    database: 'test_db',
    username: 'test_user',
    password: 'test_pw',
    host: 'localhost',
    port: 2001,
    pool: { // 池化参数同样参照sequelize
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    };
}
// db.sqlite.js文件的配置方法
module.exports = {
    path: '/etc/test.db',
    pool: { // 池化参数同样参照sequelize
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    };
}
```
**注意：基本配置只支持mysql、postgres、sqlite**

2. useBaseConfig = false 使用标准配置
```typescript
import {defineTables} from 'koa-decorator-resover';
export const {Database,connect} = new defineTables(tablesStructure, relationCallback, {
    // 是否使用基础配置文件
    useBaseConfig: false, // 默认true
    // 注意： sequelizeArgs参数不能添加，否则会优先于sequelizeArgs对数据库的配置
});
```

```
# 在工程根目录下只需要配置db.config.js文件
[base] -- db.config.js
```

```javascript
// 默认标准配置，完全sequelize参数，不需要.env
module.exports = {
  driver: "mysql",
  options: {
    mysql: [
      "default_db",
      "root",
      "root",
      {
        host: "localhost",
        port: 3306,
        dialect: "mysql",
      },
    ],
    postgres: [
      "default_db",
      "postgres",
      "password",
      {
        host: "localhost",
        port: 2345,
        dialect: "postgres",
      },
    ],
    sqlite: [
      {
        dialect: "sqlite",
        storage: require("path").resolve("dbfile", "sqlite.db"),
      },
    ],
  },
};
```
**注意：标准配置参数完全准寻sequelize参数，详细参照sequelize即可**

---

### 方法、参数一览
> [F]方法、[D]装饰器、[C]类、[I]接口、[T]类型
  - service.binder
    - [F]routeBinder - 路由绑定方法
    - [F]restfulBinder - 传统restful绑定方法（仅支持Get/Post装饰器，即将弃用）
  - service.injector
    - [F]servInjector - 服务注入器，注入插件，生成controller函数和method类别
  - decorator.builder
    - [F]injectorBuilder - 函数装饰器构建器
    - [F]classInjectorBuilder - 类装饰器构建器
    - [F]propsInjectorBuilder - 参数装饰器构建器
  - decorator.factory
    - [F]injectBind - 装饰器参数对象绑定
    - [F]injectRemove - 装饰器参数对象解除绑定
  - decorator.restful
    - [D]Get - 传统restful装饰器（配合restfulBinder使用，即将启用）
    - [D]Post - 传统restful装饰器（配合restfulBinder使用，即将启用）
  - database.baseDefined (orm共通)
    - [C]DefineDatabase - 定义数据库入口类
    - [I]OrmBaseLoader - 加载器类接口
    - [I]OrmBaseLoaderConstructor - 加载器实例化接口
  - database.configurator（orm共通）
    - [F]standardTransfor - 连接参数标准转换器
    - [I]Transfor - 连接参数转换器接口
    - [I]StandardConfigType - 配置文件内容格式接口类型
    - [F]loadConfig - 参数读取方法
  - database.loader.sequelize.loader
    - [C]OrmLoader - sequelize加载器类
    - [T]Combine - 类型继承
    - [T]CombineAny - 类型继承，元素转换成any类型
    - [T]CombineColumnModel - 继承Model并注入column字段的类型
    - [T]TablesModelType - TablesStructure推断表结构
    - [T]DefineModel - 简化sequelize.define方法
    - [T]TablesStructureProps - 表结构callback中的参数
    - [T]TablesStructure - 表结构定义
    - [T]Relation - 关系函数
    - [T]DatabaseOptions - Database装饰器参数
    - [T]GlobalOptions - 全局参数，defineTables的第三个参数类型
    - [T]DB - 注入的db的类型，通过this.db.获取
    - [I]OrmSequelize - 用于Service模块db对象注入的继承类，实现this.db.tables.???自动提示，并能提示字段
    - [I]OrmInterface - 模块接口
    - [T]RewriteModelCtor - 解析重写Model方法类型
    - [T]RewriteModelProps - 重写Model方法的类型
    - [T]RewriteModelKeys - 重写Model方法名称的list
    - [T]BaseConfigType - 配置文件内容格式接口类型
  - database.loader.sequelize.binder
    - [F]defineTables - 构建表实例入口方法
        - [F]connect - 主动连接函数
        - [D]Database - DB注入装饰器
    - [F]baseTransfor - sequelize用的连接参数转换器
  - type
    - [T]PluginConfig - 装饰器插件配置结构
    - [T]Injector - 装饰器类型声明
    - [T]ModuleFuncType - 模块函数类型
    - [T]ModuleFuncArgsType - 模块函数参数
    - [T]MethodType - restful的method

    