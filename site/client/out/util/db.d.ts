export declare function opendb<T>(dbname: string, key: keyof T & string): Promise<{
    all: () => Promise<T[]>;
    set: (val: T) => Promise<IDBValidKey>;
    get: (key: string) => Promise<T>;
    del: (key: string) => Promise<undefined>;
}>;
