import type { DrawingContext } from "../core/drawing.js";
import { View } from "./view.js";
export declare class Margin extends View {
    paddingColor: number;
    padding: number;
    init(): void;
    layout(): void;
    draw(ctx: DrawingContext, px: number, py: number): void;
    protected drawBorder(ctx: DrawingContext, px: number, py: number, col: number): void;
}
