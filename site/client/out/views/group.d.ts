import { View } from "./view.js";
export declare class Group extends View {
    gap: number;
    dir: 'x' | 'y';
    align: 'a' | 'm' | 'z' | '+';
    init(): void;
    adjust(): void;
    layout(): void;
}
export declare class GroupX extends Group {
    dir: "x";
}
export declare class GroupY extends Group {
    dir: "y";
}
