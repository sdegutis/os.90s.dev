import { Ref } from "../core/ref.js";
export declare class Dynamic {
    static make<T extends Dynamic>(this: new () => T, data: {
        [K in keyof T]?: T[K] | Ref<T[K]>;
    }): T;
    init?(): void;
    $: { readonly [K in (keyof this & string) as (K extends "$" ? never : K)]: this[K] extends ((...args: any) => any) | undefined ? never : Ref<this[K]>; };
}
