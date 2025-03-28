import type { Panel } from "../core/panel.js";
import { Ref } from "../core/ref.js";
import type { Size } from "../core/types.js";
import type { View } from "../views/view.js";
import { type MenuItem } from "./menu.js";
export declare function PanelView(data: {
    title: Ref<string>;
    children: View;
    size?: Ref<Size>;
    presented?: (panel: Panel) => void;
    onKeyDown?: (key: string) => boolean;
    menuItems?: () => MenuItem[];
}): View;
export declare function FilePanelView({ filepath, filedata, title, menuItems, onKeyDown, presented, ...data }: Parameters<typeof PanelView>[0] & {
    filepath: Ref<string | undefined>;
    filedata: () => string;
}): View;
