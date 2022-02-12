import path from 'path'
import resolve from 'rollup-plugin-node-resolve'; // 依赖引用插件
import commonjs from 'rollup-plugin-commonjs'; // commonjs模块转换插件, es5/nodejs转es6
import babel from 'rollup-plugin-babel'; // es6转es5
// import { eslint } from 'rollup-plugin-eslint' // eslint插件
import typescript from 'rollup-plugin-typescript2';
// import typescript from '@rollup/plugin-typescript';
import json from 'rollup-plugin-json';
import {
    uglify
} from 'rollup-plugin-uglify'; // 压缩代码
const plugins = [
        // nodejs 插件
        resolve({
            extensions: ['.js', '.ts', '.tsx']
        }),
        // 编译ts优先调用ts插件，把ts转换成js
        // typescript({ exclude: ['node_modules/**'], lib: ["es5", "es6", "dom"], target: "es5" }), // @rollup/plugin-typescript
        // // rollup 不支持tsconfig.module = Commonjs
        // typescript({ // rollup-plugin-typescript2
        //     verbosity: 3, // 0 -- Error  1 -- Warning  2 -- Info  3 -- Debug
        //     // clean: true, // 清除每次构建的缓存
        //     // check: false, // 代码诊断, 默认true
        //     tsconfigOverride: {
        //         module: "es2015"
        //     },
        //     // tsconfig: './tsconfig.json',
        //     typescript: require('typescript'),
        //     // useTsconfigDeclarationDir: true,
        //     tsconfig: path.resolve(__dirname, './tsconfig.json'),
        //     extensions: ['.js', '.ts', '.tsx']
        // }),
        // 代码中引入的第三方依赖中需要读取json文件的插件
        json(),
        // commonjs读取插件
        // commonjs({
        //     // include: 'node_modules/**',  // Default: undefined
        //     // exclude: ['node_modules/sqlite/**', 'node_modules/sqlite3/**', 'node_modules/sequelize'], // Default: undefined
        //     exclude: ['node_modules/**'], // Default: undefined
        //     extensions: ['.js', '.ts']
        // }),
        // babel({
        //     exclude: 'node_modules/**'
        // }),
        // 压缩代码
        uglify({
            output: {
                comments: function(node, comment) {
                    // 不保留注释
                    return false;
                }
            }
        }),
        // eslint({
        //     throwOnError: true,
        //     include: ['src/**/*.ts'],
        //     exclude: ['node_modules/**', 'lib/**']
        // })
    ]
    // const inputFile = path.resolve(__dirname, './src/resolver.ts'); // ts文件
const inputFile = path.resolve(__dirname, './lib/resolver.js'); // 优先用tsc编辑成js文件，再打包
export default [{
    input: inputFile,
    output: {
        file: 'lib/resolver.umd.js',
        format: 'umd',
        name: 'packing',
    },
    plugins
}, {
    input: inputFile,
    output: {
        file: 'lib/resolver.esm.js',
        format: 'es',
        name: 'packing',
    },
    plugins
}]