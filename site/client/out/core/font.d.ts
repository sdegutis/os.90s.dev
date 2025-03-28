import { Bitmap } from "./bitmap.js";
import type { DrawingContext } from "./drawing.js";
export declare class Font {
    spr: Bitmap;
    cw: number;
    ch: number;
    constructor(data: string);
    print(ctx: DrawingContext, x: number, y: number, c: number, text: string): void;
    calcSize(text: string): {
        w: number;
        h: number;
    };
}
