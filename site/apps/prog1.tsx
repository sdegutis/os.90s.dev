import { $$ } from "../util/jsx.js"
import { panel } from "./panel.js"

panel.frame.children = [
  $$(<view background={0x009900ff}
    x={10}
    y={10}
    w={10}
    h={10}
  ></view>).view
]

panel.frame.background = 0x99000099

panel.frame.draw()
panel.blit()
