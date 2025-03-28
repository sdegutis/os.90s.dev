import { View } from "./view.js"

export const primitives = {

  view: View,

  // image: ImageView,
  // label: Label,
  // button: Button,
  // textarea: Textarea,

  // grid: Grid,
  // border: Border,
  // margin: Margin,
  // center: Center,
  // scroll: Scroll,

  // group: Group,
  // groupx: GroupX,
  // groupy: GroupY,

  // paned: Paned,
  // panedxa: PanedXA,
  // panedxb: PanedXB,
  // panedya: PanedYA,
  // panedyb: PanedYB,

  // split: Split,
  // splitxa: SplitXA,
  // splitya: SplitYA,
  // splitxb: SplitXB,
  // splityb: SplitYB,

  // spaced: Spaced,
  // spacedx: SpacedX,
  // spacedy: SpacedY,

} satisfies Record<string, typeof View>
