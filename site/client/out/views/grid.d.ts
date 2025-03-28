import { View } from "./view.js";
export declare class Grid extends View {
    cols: number;
    flow: boolean;
    xgap: number;
    ygap: number;
    init(): void;
    adopted(parent: View): void;
    adjust(): void;
    layout(): void;
    private buildGrid;
}
