import resolve from "rollup-plugin-node-resolve"; // 依赖引用插件
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import { uglify } from "rollup-plugin-uglify"; // 压缩代码
const plugins = [
  // nodejs 插件
  resolve({
    extensions: [".js", ".ts"],
  }),
  // 代码中引入的第三方依赖中需要读取json文件的插件
  json(),
  // commonjs模块转换插件, es5/nodejs转es6
  commonjs({
    // include: 'node_modules/**',
    exclude: ["node_modules/**"],
    extensions: [".js", ".ts"],
  }),
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
      file: "es/resolver.js",
      format: "es",
      name: "resolver",
    },
    plugins,
  },
];
