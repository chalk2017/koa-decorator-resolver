# koa-decorator-resolver :zap:
[![license:MIT](https://img.shields.io/badge/License-MIT-green)](https://www.npmjs.com/package/koa-decorator-resolver) [![node:>=14](https://img.shields.io/badge/node-^14.x.x-blue)](https://www.python.org/downloads/) [![SQL@Support:sqlite|postgres|mysql](https://img.shields.io/badge/SQL%40Support-sqlite%20%7C%20postgres%20%7C%20mysql-lightgrey)](https://github.com/chalk2017/koa-decorator-resolver) 

**koa服务端框架装饰器解决方案**

> Database orm: sequelize=^6.x.x

------------
- ## Directory
- [Install](#Install)
- [Default Restful](#Default-Restful)
  - [how to use it](#how-to-use-it)
  - [plugins define](#plugins-define)
- [Use Database](#Use-Database)
  - [config database](#config-database)
    - [use parameters](#use-parameters)
    - [use env & db file](#use-file)
  - [use sequelize](#use-sequelize)
  - [declare tables](#declare-tables)
  - [use transaction](#use-transaction)
  - [mysql & postgres](#mysql-postgres)
- [Common Restful](#Common-Restful)
  - [how to use it](#get-post)

### Install
```
# install package
npm install koa-decorator-resolve

# if you need to use sqlite database, you need to install the driver of sqlite, such as
npm install sqlite@4.x.x sqlite3@5.x.x

# if you need to use mysql database, you need to install the driver of mysql, such as
npm install mysql2@2.x.x
```
-----
### Default-Restful
> The default method of restful is post, and the url is ":hostname/:className/:functionName"
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
