import resolve from 'rollup-plugin-node-resolve'; // 依赖引用插件
import {
    uglify
} from 'rollup-plugin-uglify'; // 压缩代码
const plugins = [
    // nodejs 插件
    resolve({
        extensions: ['.js', '.ts']
    }),
    // 压缩代码
    uglify({
        output: {
            comments: function(node, comment) {
                // 不保留注释
                return false;
            }
        }
    })
]

export default [{
    input: 'esm/resolver.js',
    output: {
        file: 'lib/resolver.js',
        format: 'es',
        name: 'resolver',
    },
    plugins
}]