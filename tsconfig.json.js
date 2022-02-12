export default {
    "compilerOptions": {
        "baseUrl": ".",
        "outDir": "./lib", // 输出目录
        "sourceMap": false, // 是否生成sourceMap
        // "target": "es2015",
        // "module": "commonjs",
        "target": "esnext", // 编译目标
        "module": "esnext", // 模块类型
        "moduleResolution": "node",
        "allowJs": false, // 是否编辑js文件
        "strict": true, // 严格模式
        "noUnusedLocals": true, // 未使用变量报错
        "experimentalDecorators": true, // 启动装饰器
        "resolveJsonModule": true, // 加载json
        "esModuleInterop": true,
        "removeComments": false, // 删除注释


        "declaration": true, // 生成定义文件
        "declarationMap": false, // 生成定义sourceMap
        "declarationDir": "./lib/types", // 定义文件输出目录


        "lib": ["esnext", "dom"], // 导入库类型定义
        "types": ["node"] // 导入指定类型包
    },
    "include": [
        "src/*" // 导入目录
    ]

}