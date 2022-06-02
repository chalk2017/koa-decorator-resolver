/**
 *  restful请求装饰器
 */
import { TargetType } from "../type";
export function Get(
  url: string
): (
  target: TargetType,
  propertyKey: string,
  props: PropertyDescriptor
) => PropertyDescriptor {
  const decoratorFunc = (
    target,
    propertyKey,
    { configurable, enumerable, value, writable }
  ) => {
    const func = async (...args) => {
      const res = await value.apply(target, args);
      return res;
    };
    if (target.$restful) {
      target.$restful[propertyKey] = {
        url,
        method: "get",
      };
    } else {
      target.$restful = {
        [propertyKey]: {
          url,
          method: "get",
        },
      };
    }
    return { configurable, enumerable, value: func, writable };
  };
  return decoratorFunc;
}

export function Post(
  url: string
): (
  target: TargetType,
  propertyKey: string,
  props: PropertyDescriptor
) => PropertyDescriptor {
  const decoratorFunc = (
    target,
    propertyKey,
    { configurable, enumerable, value, writable }
  ) => {
    const func = async (...args) => {
      const res = await value.apply(target, args);
      return res;
    };
    if (target.$restful) {
      target.$restful[propertyKey] = {
        url,
        method: "post",
      };
    } else {
      target.$restful = {
        [propertyKey]: {
          url,
          method: "post",
        },
      };
    }
    return { configurable, enumerable, value: func, writable };
  };
  return decoratorFunc;
}
