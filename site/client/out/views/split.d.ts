import type { DrawingContext } from "../core/drawing.js";
import { View } from "./view.js";
declare class SplitDivider extends View {
    split: Split;
    canMouse: boolean;
    pressed: boolean;
    get cursor(): import("../core/cursor.js").Cursor;
    draw(ctx: DrawingContext, px: number, py: number): void;
    onMouseEnter(): void;
    onMouseExit(): void;
    onMouseDown(button: number): void;
}
export declare class Split extends View {
    dividerColorHovered: number;
    dividerColorPressed: number;
    pos: number;
    min: number;
    max: number;
    dir: 'x' | 'y';
    stick: 'a' | 'b';
    resizer?: SplitDivider;
    init(): void;
    layout(): void;
}
export declare class SplitXA extends Split {
    dir: "x";
    stick: "a";
}
export declare class SplitYA extends Split {
    dir: "y";
    stick: "a";
}
export declare class SplitXB extends Split {
    dir: "x";
    stick: "b";
}
export declare class SplitYB extends Split {
    dir: "y";
    stick: "b";
}
export {};
