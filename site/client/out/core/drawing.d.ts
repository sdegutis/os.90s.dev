export declare class DrawingContext {
    canvas: OffscreenCanvas;
    private ctx;
    constructor(w?: number, h?: number);
    fillRect(x: number, y: number, w: number, h: number, c: number): void;
    strokeRect(x: number, y: number, w: number, h: number, c: number): void;
    clip(x: number, y: number, w: number, h: number): void;
    unclip(): void;
    drawImage(canvas: OffscreenCanvas | ImageBitmap, x: number, y: number): void;
    drawImagePortion(canvas: OffscreenCanvas, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
}
export declare function colorFor(col: number): string;
