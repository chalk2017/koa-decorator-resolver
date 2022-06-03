// import resolve from "rollup-plugin-node-resolve"; // 转node模块
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs"; // 转commonjs模块
// import babel from "rollup-plugin-babel"; // es6转es5
import json from "rollup-plugin-json";
import { uglify } from "rollup-plugin-uglify"; // 压缩代码
// import path from 'path';
const plugins = [
  // 合并文件，转cjs
  commonjs({
    /**
     * lib/* : lib下所有文件会打包到一个文件里，但require(./xxxx)都保留
     * lib/** : 没效果
     * 不设置 : 默认引用到 node_modules/sequelize 里的第一层
     */
    // include: 'lib/*',
    /**
     * node_modules/** : 默认引用到 node_modules/sequelize 里的第一层
     * 不设置 : 全部文件打包到一起， 需要json()插件
     */
    exclude: ['node_modules/**'],
    extensions: [".js", ".ts"],
  }),
  // // es6转es5
  // babel({
  //   exclude: "node_modules/**",
  // }),
  // 转node模块
  nodeResolve({
    extensions: [".js", ".ts"],
  }),
  // 代码中引入的第三方依赖中需要读取json文件的插件
  json(),
  // 压缩代码
  uglify({
    output: {
      comments: function (node, comment) {
        // 不保留注释
        return false;
      },
    },
  }),
];

export default [
  {
    input: "dist/index.js",
    output: {
      // dir: "cjs",
      file: "cjs/resolver.js",
      format: "cjs", // 转commonjs模块
    },
    external:['sequelize'], // 指定引入的依赖为外部依赖，sequelize保持原始require('sequelize')方式
    plugins,
  },
  {
    input: "dist/index.js",
    output: {
      file: "esm/resolver.js",
      format: "esm", // 转es6模块
    },
    external:['sequelize'],
    plugins,
  },
];
