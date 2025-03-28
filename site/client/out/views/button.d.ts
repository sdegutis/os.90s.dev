import type { DrawingContext } from "../core/drawing.js";
import { Border } from "./border.js";
export declare class Button extends Border {
    hoverBackground: number;
    pressBackground: number;
    selectedBackground: number;
    canMouse: boolean;
    onClick?(button: number): void;
    init(): void;
    onMouseDown(button: number): void;
    onMouseExit(): void;
    draw(ctx: DrawingContext, px: number, py: number): void;
}
