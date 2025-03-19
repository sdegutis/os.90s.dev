import { border } from "./border.js"
import { button } from "./button.js"
import { group, groupx, groupy } from "./group.js"
import { image } from "./image.js"
import { label } from "./label.js"
import { paned, panedxa, panedxb, panedya, panedyb } from "./paned.js"
import { spaced, spacedx, spacedy } from "./spaced.js"
import { split, splitx, splity } from "./split.js"
import { view } from "./view.js"

export const primitives = {

  view,
  border,
  label,
  image,
  button,

  group,
  groupx,
  groupy,

  paned,
  panedxa,
  panedxb,
  panedya,
  panedyb,

  split,
  splitx,
  splity,

  spaced,
  spacedx,
  spacedy,

} satisfies Record<string, typeof view>
