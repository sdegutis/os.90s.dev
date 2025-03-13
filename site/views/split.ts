import { View } from "./view.js"

export class Split extends View {

  pos = 10
  min = 0
  max = 0
  dir: 'x' | 'y' = 'y'

}

export class SplitX extends Split {
  override dir = 'x' as const
}

export class SplitY extends Split {
  override dir = 'y' as const
}
