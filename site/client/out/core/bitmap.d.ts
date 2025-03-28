export declare class Bitmap {
    static fromString(s: string): Bitmap;
    width: number;
    height: number;
    private original;
    canvas: OffscreenCanvas;
    private ctx;
    private colors;
    pixels: number[];
    private lastcol?;
    constructor(colors: number[], w: number, pixels: number[]);
    toString(): string;
    colorize(col: number): void;
}
