import type { Process } from "./process.js"

export class Panel {

  static focused?: Panel
  static ordered: Panel[] = []
  static map = new Map<number, Panel>()
  static id = 0
  id

  x = 0
  y = 0
  w = 100
  h = 100

  img?: ImageBitmap

  constructor(proc: Process) {
    Panel.map.set(this.id = ++Panel.id, this)
    Panel.ordered.push(this)

    this.x = (Panel.focused?.x ?? 0) + 10
    this.y = (Panel.focused?.y ?? 0) + 10

    Panel.focused = this
  }

}
