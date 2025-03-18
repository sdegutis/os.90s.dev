import { border } from "./border.js"
import { view, type IntrinsicView } from "./view.js"

export const primitives = {
  view,
  border,
} satisfies Record<string, () => IntrinsicView>
