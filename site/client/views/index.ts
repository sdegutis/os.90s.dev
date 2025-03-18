import { border } from "./border.js"
import { label } from "./label.js"
import { view, type IntrinsicView } from "./view.js"

export const primitives = {
  view,
  border,
  label,
} satisfies Record<string, () => IntrinsicView>
