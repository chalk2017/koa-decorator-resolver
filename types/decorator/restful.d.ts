/**
 *  restful请求装饰器
 */
import { TargetType } from "../type";
export declare function Get(url: string): (target: TargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
export declare function Post(url: string): (target: TargetType, propertyKey: string, props: PropertyDescriptor) => PropertyDescriptor;
