import { Border } from "./border.js"
import { Label } from "./label.js"
import { Paned, PanedXA, PanedXB, PanedYA, PanedYB } from "./paned.js"
import { Split, SplitX, SplitY } from "./split.js"
import { View } from "./view.js"

export const controls = {

  view: View,
  border: Border,
  label: Label,

  paned: Paned,
  panedxa: PanedXA,
  panedxb: PanedXB,
  panedya: PanedYA,
  panedyb: PanedYB,

  split: Split,
  splitx: SplitX,
  splity: SplitY,

}
