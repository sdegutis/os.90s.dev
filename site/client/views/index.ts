import { Border } from "/client/views/border.js"
import { Button } from "/client/views/button.js"
import { Center } from "/client/views/center.js"
import { Grid } from "/client/views/grid.js"
import { Group, GroupX, GroupY } from "/client/views/group.js"
import { ImageView } from "/client/views/image.js"
import { Label } from "/client/views/label.js"
import { Margin } from "/client/views/margin.js"
import { Paned, PanedXA, PanedXB, PanedYA, PanedYB } from "/client/views/paned.js"
import { Scroll } from "/client/views/scroll.js"
import { Spaced, SpacedX, SpacedY } from "/client/views/spaced.js"
import { Split, SplitXA, SplitXB, SplitYA, SplitYB } from "/client/views/split.js"
import { Textarea } from "/client/views/textarea.js"
import { View } from "/client/views/view.js"

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
