import { TargetType } from "../type";

// restful请求装饰器

export function Get(url: string): (
    target: TargetType,
    propertyKey: string,
    props: PropertyDescriptor
) => PropertyDescriptor;

export function Post(url: string): (
    target: TargetType,
    propertyKey: string,
    props: PropertyDescriptor
) => PropertyDescriptor;
