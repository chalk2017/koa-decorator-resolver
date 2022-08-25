import { injectorBuilder, Injector, PluginConfig } from "../src/index";
// 声明装饰器
export const Test: Injector<{}> = injectorBuilder("Test");
export const Verify: Injector<{}> = injectorBuilder("Verify");
// 装饰器配置
export const config: PluginConfig = {
  Test: {
    before: {
      plugin: (ctx, option) => {
        return {plugin: 'Test::before'};
      },
      replaceProps: true,
    },
    after: {
      plugin: (ctx, option) => {
        return {plugin: 'Test::after'};
      },
      replaceProps: true,
    },
  },
  Verify: {
    intercept: async (func, args, option) => {
        return await func(...args);
    },
  },
};
