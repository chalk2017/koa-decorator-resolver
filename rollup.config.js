import resolve from "rollup-plugin-node-resolve"; // 转node模块
import commonjs from "rollup-plugin-commonjs"; // 转commonjs模块
// import babel from "rollup-plugin-babel"; // es6转es5
import json from "rollup-plugin-json";
import { uglify } from "rollup-plugin-uglify"; // 压缩代码
const plugins = [
  // 合并文件，转cjs
  commonjs({
    // include: 'node_modules/**',
    exclude: ["node_modules/**"],
    extensions: [".js", ".ts"],
  }),
  // es6转es5
  // babel({
  //   exclude: "node_modules/**",
  // }),
  // 转node模块
  resolve({
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
    input: "lib/index.js",
    output: {
      // dir: "cjs",
      file: "cjs/resolver.js",
      format: "cjs", // 转commonjs模块
    },
    plugins
  },
  {
    input: "lib/index.js",
    output: {
      file: "esm/resolver.js",
      format: "esm", // 转es6模块
    },
    plugins
  },
];
