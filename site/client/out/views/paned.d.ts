import { View } from "./view.js";
export declare class Paned extends View {
    gap: number;
    dir: 'x' | 'y';
    vacuum: 'a' | 'b';
    init(): void;
    layout(): void;
}
export declare class PanedXA extends Paned {
    dir: "x";
    vacuum: "a";
}
export declare class PanedXB extends Paned {
    dir: "x";
    vacuum: "b";
}
export declare class PanedYA extends Paned {
    dir: "y";
    vacuum: "a";
}
export declare class PanedYB extends Paned {
    dir: "y";
    vacuum: "b";
}
