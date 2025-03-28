export type Equals<T> = (a: T, b: T) => boolean;
export declare class Ref<T> {
    private interceptors;
    private listener;
    private _val;
    equals?: Equals<T> | undefined;
    constructor(val: T, equals?: Equals<T>);
    get val(): T;
    set val(val: T);
    watch(fn: (data: T, old: T) => void): import("./listener.js").ListenerDone;
    intercept(fn: (data: T) => T, deps?: Ref<any>[]): () => boolean;
    adapt<U>(fn: (data: T, old: T) => U): Ref<U>;
}
export declare const $: <T>(val: T) => Ref<T>;
export declare function multiplex<T>(refs: Ref<any>[], fn: () => T): Ref<T>;
