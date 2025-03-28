import { Button } from "./button.js";
import { View } from "./view.js";
export declare class Scroll extends View {
    scrollBy: number;
    scrollx: number;
    scrolly: number;
    content: View;
    area: View;
    barv: Button;
    barh: Button;
    trackv: View;
    trackh: View;
    corner: View;
    showh: boolean;
    showv: boolean;
    canMouse: boolean;
    init(): void;
    private constrainContent;
    onWheel(px: number, py: number): void;
    layout(): void;
}
