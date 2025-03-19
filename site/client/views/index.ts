import { border } from "./border.js"
import { group, groupx, groupy } from "./group.js"
import { image } from "./image.js"
import { label } from "./label.js"
import { paned, panedxa, panedxb, panedya, panedyb } from "./paned.js"
import { view } from "./view.js"

export const primitives = {

  view,
  border,
  label,
  image,

  group,
  groupx,
  groupy,

  paned,
  panedxa,
  panedxb,
  panedya,
  panedyb,

} satisfies Record<string, typeof view>
