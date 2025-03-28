import type { Ref } from "../core/ref.js";
import type { Point, Size } from "../core/types.js";
export declare function dragMove(anchor: Ref<Point>, o: Ref<Point>): import("../core/listener.js").ListenerDone;
export declare function dragResize(anchor: Ref<Point>, o: Ref<Size>): import("../core/listener.js").ListenerDone;
