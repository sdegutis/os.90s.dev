export type PanelOrdering = 'normal' | 'bottom' | 'top';
export type FsItem = {
    type: 'folder' | 'file';
    name: string;
};
export interface ServerProgram {
    init(): Promise<[id: number, w: number, h: number, keymap: string[], font: string]>;
    newpanel(ord: PanelOrdering, x: number, y: number, w: number, h: number): Promise<[id: number, x: number, y: number, port: MessagePort]>;
    terminate(pid: number): void;
    resize(w: number, h: number): void;
    launch(path: string, opts: Record<string, any>): Promise<[number]>;
    watchprocs(): Promise<[]>;
    openipc(pid: number): Promise<[MessagePort | null]>;
    listdrives(): Promise<string[]>;
    getfile(path: string): Promise<[content: string | undefined]>;
    putfile(path: string, content: string): Promise<[]>;
    listdir(path: string): Promise<FsItem[]>;
    mount(name: string): Promise<[]>;
    unmount(name: string): Promise<[]>;
}
export interface ClientProgram {
    ping(n: number): Promise<[n: number]>;
    resized(w: number, h: number): void;
    keydown(key: string): void;
    keyup(key: string): void;
    procbegan(pid: number): void;
    procended(pid: number): void;
    gotipc(port: MessagePort): void;
}
export interface ServerPanel {
    adjust(x: number, y: number, w: number, h: number): void;
    blit(img: ImageBitmap): void;
    close(): void;
    focus(): void;
    cursor(data: string): void;
}
export interface ClientPanel {
    focus(): void;
    blur(): void;
    mouseentered(): void;
    mouseexited(): void;
    mousemoved(x: number, y: number): void;
    mousedown(b: number): void;
    mouseup(): void;
    wheel(x: number, y: number): void;
    needblit(): void;
}
type EventMap<T> = {
    [K in keyof T]: (...args: any) => void;
};
type Reply<A> = (data: A, ts?: Transferable[]) => void;
type Handler<T extends (...args: any) => any> = T extends (...args: infer A) => Promise<infer R> ? (reply: Reply<R>, ...args: A) => void : T;
type Handlers<T extends EventMap<T>> = {
    [K in keyof T]: Handler<T[K]>;
};
export declare class wRPC<In extends EventMap<In>, Out extends EventMap<Out>> {
    cid: number;
    port: MessagePort | Worker | Window;
    handlers: Handlers<In>;
    waiters: Map<number, (data: any) => void>;
    constructor(port: Worker | Window | MessagePort, handlers: Handlers<In>);
    send<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]): void;
    call<K extends keyof Out>(name: K, data: Parameters<Out[K]>, transfer?: Transferable[]): Promise<Awaited<ReturnType<Out[K]>>>;
}
export {};
