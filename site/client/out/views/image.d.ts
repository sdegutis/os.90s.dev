import type { Bitmap } from "../core/bitmap.js";
import type { DrawingContext } from "../core/drawing.js";
import { View } from "./view.js";
export declare class ImageView extends View {
    bitmap: Bitmap | null;
    init(): void;
    adjust(): void;
    draw(ctx: DrawingContext, px: number, py: number): void;
}
