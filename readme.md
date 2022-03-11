# koa-decorator-resolver :zap:
[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver) [![node:>=14](https://img.shields.io/badge/node-^14.x.x-blue)](https://www.python.org/downloads/) [![SQL@Support:sqlite|postgres|mysql](https://img.shields.io/badge/SQL%40Support-sqlite%20%7C%20postgres%20%7C%20mysql-lightgrey)](https://github.com/chalk2017/koa-decorator-resolver) 

**This is a solution with using decorator in Koa**

> Database orm: sequelize=^6.x.x

------------
- ## Directory
- [Install](#Install)
- [Default Restful](#Default-Restful)
  - [how to use it](#how-to-use-it)
  - [plugins define](#plugins-define)
- [Use Database](#Use-Database)
  - [config database](#config-database)
    - [create connection instance](#create-connection-instance)
    - [declare tables](#declare-tables)
    - [declare decorator](#declare-decorator)
    - [use sequelize](#use-sequelize)
    - [use transaction](#use-transaction)
  - [mysql & postgres](#mysql-postgres)
  - [use env & db file](#use-file)
- [Common Restful](#Common-Restful)
  - [how to use it](#get-post)

### Install
```
# install package
npm install koa-decorator-resolve

# if you need sqlite database, you will need to install the sqlite driver, such as
npm install sqlite@4.x.x sqlite3@5.x.x

# if you need mysql database, you will need to install the mysql driver, such as
npm install mysql2@2.x.x
```
-----
### Default-Restful
> You don't need to declare restful urls, the names of classes and functions are automatically resolved to urls, and the url format is ":hostname/:className/:functionName", but the default restful method is "post", if you want to send a get request, you can add a custom decorators to resolve it.
#### how-to-use-it
- **file: index.ts**
```typescript
// the entry of project
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { routeBinder } from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
const router = new Router();
routeBinder(router,serviceModules);
app.use(router.routes());
app.listen(8080, () => {
    console.log('server start on 8080');
});
```
- **file: serviceModules.ts**
```typescript
// the restful modules
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
- **send request in frontend**
```javascript
    axios.post('/serviceModule1/func1',{name:'m1f1'}).then(res=>{
        console.log(res); // the result is : {name:'m1f1 func1',msg'success'}
    })
    axios.post('/serviceModule2/func3',{name:'m2f3'}).then(res=>{
        console.log(res); // the result is : {name:'m2f3 func3',msg'success'}
    })
```

#### plugins-define
> you can define some decorator, and to extend extra function
##### 1. define plugins and decorator
- **file: plugins.ts**
```typescript
import {injectorBuilder,Injector} from 'koa-decorator-resolve';
// declare decorator
type Option = {value:string}
export const Transfer: Injector<Option> = injectorBuilder('Transfer');
// config interceptor
export const config = {
    Transfer: {
        method: 'get', // default is post
        before: {
            plugin: (ctx: any, option?: Option) => {
                return {'transfer-before':option.value};
            },
            replaceProps: true, // replace service function input parameter
        },
        after: {
            plugin: (res: any, ctx: any, option?: Option) => {
                return {'transfer-after':res}
            },
            replaceProps: true, // replace service function output return data
        }
    }
}
```
##### 2. add plugins
- **file: index.ts**
```typescript
// the entry of project
import * as Koa from 'koa';
import * as Router from 'koa-router';
import {routeBinder,PluginConfig} from 'koa-decorator-resolve';
import * as serviceModules from './serviceModules';
import {config} from './plugins';
const router = new Router();
routeBinder(router,serviceModules,config as PluginConfig);
app.use(router.routes());
app.listen(8080, () => {
    console.log('server start on 8080');
});
```
##### 3. use decorator

- **file: serviceModules.ts**
```typescript
// the restful modules
import {Transfer} from './plugins';
export class serviceModule {
    @Transfer({value:123})
    func(data){
        // value of data : {'transfer-before':123}
        return 456
    }
    // the result of request : {'transfer-after':456}
}
```

### Use-Database
> Invoke the database through the decorator
#### config-database
> Create a instance of database with tables
1. create-connection-instance
> the first is create a database connection.
- **file: initTables.ts**
```typescript
import {defineTables} from 'koa-decorator-resolve';
import {TablesType,tablesStructure,relationCallback} from './declareTables';
export const tablesInstance = new defineTables<TablesType>(tablesStructure, relationCallback, {
    connConf: {
        driver: 'sqlite',
        path: require('path').resolve('db/database_file.db')
    }
});
// const tablesInstance = new defineTables<TablesType>(tablesStructure, relation, {
//     connConf: {
//         driver: 'mysql',
//         database: 'database',
//         username: 'db_user',
//         password: 'db_password',
//         host: '127.0.0.1',
//         port: 2100
//     }
// });
```
2. declare-tables
> Used to generate models of "sequelize", it is base in sequelize.
- **file: declareTables.ts**
```typescript
// it used sequelize' type
import { STRING, INTEGER, BIGINT, DATE, TIME, DATEONLY, BOOLEAN, FLOAT, DOUBLE } from 'sequelize';
// this is tables' structure
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
// Relationships between tables can be defined here
export const relationCallback = (tableModels) => {
    const accessModel = tableModels['ACCESS'];
    // ...
}
```
3. declare-decorator
- **file: declareDecorator.ts**
```typescript
import {tablesInstance} from './initTables';
export const Sqlite = tablesInstance.Database.bind(tablesInstance) as typeof tablesInstance.Database;
```
4. use-sequelize
> You can use decorators in service modules
```typescript
// the restful modules
import {OrmConnectionType} from 'koa-decorator-resolve';
import {Sqlite} from './declareDecorator';
export class serviceModule {
    private db: OrmConnectionType;
    @Sqlite({
        useOrm:true,
        tables:['ACCESS'] // If this parameter is not defined, all tables were defined
    })
    async func(data){
        return await this.db.ACCESS.findAll() // Usage refer to the website of sequelize
    }
}
```
5. use-transaction
> You can use transaction in service modules
```typescript
// the restful modules
import {OrmConnectionType} from 'koa-decorator-resolve';
import {Sqlite} from './declareDecorator';
export class serviceModule {
    private db: OrmConnectionType;
    @Sqlite({
        useOrm:true,
        tables:['ACCESS'],
        useTransaction:true // use transaction
    })
    async func(data){
        return await this.db.ACCESS.findAll() // Usage refer to the website of sequelize
    }
}
```
#### mysql-postgres


#### use-file

### Common-Restful

#### get-post