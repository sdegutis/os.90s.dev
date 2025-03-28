import { Bitmap } from "./bitmap.js";
export declare class Cursor {
    static readonly NONE: Cursor;
    offx: number;
    offy: number;
    bitmap: Bitmap;
    static fromString(s: string): Cursor;
    constructor(offx: number, offy: number, bitmap: Bitmap);
    toString(): string;
    draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, px: number, py: number): void;
}
