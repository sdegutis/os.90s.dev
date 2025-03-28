import { Border } from "./border.js"
import { Button } from "./button.js"
import { Center } from "./center.js"
import { Grid } from "./grid.js"
import { Group, GroupX, GroupY } from "./group.js"
import { ImageView } from "./image.js"
import { Label } from "./label.js"
import { Margin } from "./margin.js"
import { Paned, PanedXA, PanedXB, PanedYA, PanedYB } from "./paned.js"
import { Scroll } from "./scroll.js"
import { Spaced, SpacedX, SpacedY } from "./spaced.js"
import { Split, SplitXA, SplitXB, SplitYA, SplitYB } from "./split.js"
import { Textarea } from "./textarea.js"
import { View } from "./view.js"

export const primitives = {

  view: View,

  image: ImageView,
  label: Label,
  button: Button,
  textarea: Textarea,

  grid: Grid,
  border: Border,
  margin: Margin,
  center: Center,
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
  splitxa: SplitXA,
  splitya: SplitYA,
  splitxb: SplitXB,
  splityb: SplitYB,

  spaced: Spaced,
  spacedx: SpacedX,
  spacedy: SpacedY,

} satisfies Record<string, typeof View>
