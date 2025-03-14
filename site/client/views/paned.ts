import { View } from "./view.js"

export class Paned extends View {

  gap = 0
  dir: 'x' | 'y' = 'x'
  vacuum: 'a' | 'b' = 'a'

}

export class PanedXA extends Paned {
  override dir = 'x' as const
  override vacuum = 'a' as const
}

export class PanedXB extends Paned {
  override dir = 'x' as const
  override vacuum = 'b' as const
}

export class PanedYA extends Paned {
  override dir = 'y' as const
  override vacuum = 'a' as const
}

export class PanedYB extends Paned {
  override dir = 'y' as const
  override vacuum = 'b' as const
}
