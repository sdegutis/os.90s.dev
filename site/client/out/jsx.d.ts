import { Ref } from "./core/ref.js";
import { primitives } from "./views/index.js";
import { View } from "./views/view.js";
type Primitives = typeof primitives;
type JsxAttrs<T> = {
    [K in keyof T]?: (K extends 'children' ? View | View[] | Ref<View[]> : T[K] extends ((...args: infer A) => infer R) | undefined ? ((this: T, ...args: A) => R) | undefined : T[K] | Ref<T[K]>);
};
declare global {
    namespace JSX {
        type DataFor<K extends keyof Primitives> = JsxAttrs<InstanceType<Primitives[K]>>;
        type IntrinsicElements = {
            [K in keyof Primitives as K]: JsxAttrs<InstanceType<Primitives[K]>>;
        };
        type ElementChildrenAttribute = {
            children: any;
        };
        type Element = View;
        type ElementType = keyof IntrinsicElements | ((data: any) => JSX.Element);
    }
}
export declare const Fragment = "";
export declare const jsxs: typeof createNode;
export declare const jsx: typeof createNode;
declare function createNode(tag: any, data: Record<string, any>): JSX.Element;
export {};
