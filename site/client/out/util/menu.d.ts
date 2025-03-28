export type MenuItem = {
    text: string;
    onClick(): void;
} | '-';
export declare function showMenu(items: MenuItem[], from?: import("../core/types.js").Point): Promise<void>;
