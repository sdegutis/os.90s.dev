import { Font } from "./font.js";
import { Listener } from "./listener.js";
import { Panel } from "./panel.js";
import { Ref } from "./ref.js";
import { type PanelOrdering } from "./rpc.js";
import type { Point, Size } from "./types.js";
declare class Program {
    pid: number;
    opts: Record<string, any>;
    panels: Set<Panel>;
    exitsOnLastPanelClose: boolean;
    get focusedPanel(): Panel | undefined;
    terminate(): void;
}
export declare const program: Program;
declare class Sys {
    private rpc;
    procbegan: Listener<number, void>;
    procended: Listener<number, void>;
    ipcopened: Listener<MessagePort, void>;
    keymap: Set<string>;
    readonly $mouse: Ref<Point>;
    get mouse(): Point;
    set mouse(p: Point);
    $font: Ref<Font>;
    get font(): Font;
    set font(f: Font);
    $size: Ref<Size>;
    get size(): Size;
    set size(s: Size);
    init(): Promise<void>;
    makePanel(config: {
        order?: PanelOrdering;
        pos?: Ref<Point> | 'default' | 'center';
        view: JSX.Element;
    }): Promise<Panel>;
    watchprocs(): Promise<void>;
    endproc(pid: number): void;
    resize(w: number, h: number): void;
    listdrives(path: string): Promise<string[]>;
    listdir(path: string): Promise<import("./rpc.js").FsItem[]>;
    getfile(path: string): Promise<string | undefined>;
    putfile(path: string, content: string): Promise<void>;
    mount(name: string): Promise<void>;
    unmount(name: string): Promise<void>;
    launch(path: string, file?: string): Promise<number>;
    openipc(pid: number): Promise<MessagePort | null>;
}
export declare const sys: Sys;
export {};
