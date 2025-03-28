import type { DrawingContext } from "../core/drawing.js";
import { type Font } from "../core/font.js";
import { View } from "./view.js";
export declare class Label extends View {
    textColor: number;
    font: Font;
    text: string;
    init(): void;
    adjust(): void;
    draw(ctx: DrawingContext, px: number, py: number): void;
}
