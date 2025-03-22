import { Border } from "./border.js"
import { Button } from "./button.js"
import { Group, GroupX, GroupY } from "./group.js"
import { ImageView } from "./image.js"
import { Label } from "./label.js"
import { Margin } from "./margin.js"
import { Paned, PanedXA, PanedXB, PanedYA, PanedYB } from "./paned.js"
import { Scroll } from "./scroll.js"
import { Spaced, SpacedX, SpacedY } from "./spaced.js"
import { Split, SplitX, SplitY } from "./split.js"
import { Textarea } from "./textarea.js"
import { View } from "./view.js"

export const primitives = {

  view: View,
  border: Border,
  margin: Margin,
  label: Label,
  image: ImageView,
  button: Button,
  textarea: Textarea,

  scroll: Scroll,

  group: Group,
  groupx: GroupX,
  groupy: GroupY,

  paned: Paned,
  panedxa: PanedXA,
  panedxb: PanedXB,
  panedya: PanedYA,
  panedyb: PanedYB,

  split: Split,
  splitx: SplitX,
  splity: SplitY,

  spaced: Spaced,
  spacedx: SpacedX,
  spacedy: SpacedY,

} satisfies Record<string, typeof View>
