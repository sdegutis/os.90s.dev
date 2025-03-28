import { View } from "./view.js";
export declare class Spaced extends View {
    dir: 'x' | 'y';
    init(): void;
    adjust(): void;
    layout(): void;
}
export declare class SpacedX extends Spaced {
    dir: "x";
}
export declare class SpacedY extends Spaced {
    dir: "y";
}
