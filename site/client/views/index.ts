import { border } from "./border.js"
import { image } from "./image.js"
import { label } from "./label.js"
import { view, type IntrinsicView } from "./view.js"

export const primitives = {
  view,
  border,
  label,
  image,
} satisfies Record<string, () => IntrinsicView>
