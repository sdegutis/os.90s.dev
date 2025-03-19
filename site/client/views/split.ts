import { Bitmap } from "../../shared/bitmap.js"
import { Cursor } from "../../shared/cursor.js"
import { view } from "./view.js"

const xresize = new Cursor(2, 1, new Bitmap([0x00000099, 0xffffffff], 5, [
  1, 1, 1, 1, 1,
  1, 2, 2, 2, 1,
  1, 1, 1, 1, 1,
]))

const yresize = new Cursor(1, 2, new Bitmap([0x00000099, 0xffffffff], 3, [
  1, 1, 1,
  1, 2, 1,
  1, 2, 1,
  1, 2, 1,
  1, 1, 1,
]))

// class SplitDivider extends View {

//   pressed = false
//   split!: Split

//   override init(): void {
//     const dividerColor = 0x33333300
//     this.background = dividerColor
//     this.cursor = this.split.dir === 'x' ? xresize : yresize
//   }

//   override onResized(): void { }

//   override draw(): void {
//     super.draw()

//     const dividerColorHover = 0xffffff33
//     const dividerColorPress = 0x1177ffcc
//     const dividerWidth = 1

//     const dx = this.split.dir
//     const dw = dx === 'x' ? 'w' : 'h'

//     const x = dx === 'x' ? Math.round((this[dw] - dividerWidth) / 2) : 0
//     const y = dx === 'y' ? Math.round((this[dw] - dividerWidth) / 2) : 0
//     const w = dx === 'x' ? dividerWidth : this.w
//     const h = dx === 'y' ? dividerWidth : this.h

//     if (this.pressed) {
//       crt.rectFill(x, y, w, h, dividerColorPress)
//     }
//     else if (this.hovered) {
//       crt.rectFill(x, y, w, h, dividerColorHover)
//     }
//   }

//   override onMouseDown(): void {
//     const s = this.split
//     const dx = s.dir
//     const dw = dx === 'x' ? 'w' : 'h'

//     const b = { x: 0, y: 0 }
//     b[dx] = s.pos

//     this.pressed = true

//     const drag = dragMove(b)
//     sys.trackMouse({
//       move: () => {
//         drag()
//         s.pos = b[dx]
//         if (s.min && s.pos < s.min) s.pos = s.min
//         if (s.max && s.pos > s[dw] - s.max) s.pos = s[dw] - s.max
//       },
//       up: () => this.pressed = false,
//     })
//   }

// }

export class split extends view {

  readonly pos: number = 10
  readonly min: number = 0
  readonly max: number = 0
  readonly dir: 'x' | 'y' = 'y'

  // private resizer!: SplitDivider

  // override init(): void {
  //   this.resizer = $(SplitDivider, { split: this })
  //   this.addChild(this.resizer)
  //   this.$watch('pos', () => this.layoutTree())
  // }

  // override onChildResized(): void {
  //   this.adjust?.()
  //   this.layoutTree()
  // }

  // override layout(): void {
  //   const dx = this.dir
  //   const dw = dx === 'x' ? 'w' : 'h'
  //   const a = { ...this.children[0] }
  //   const b = { ...this.children[1] }

  //   a.x = b.x = 0
  //   a.y = b.y = 0
  //   a.w = b.w = this.w
  //   a.h = b.h = this.h

  //   a[dw] = this.pos

  //   b[dx] = this.pos
  //   b[dw] = this[dw] - this.pos

  //   if (this.resizer) {
  //     this.resizer.x = 0
  //     this.resizer.y = 0
  //     this.resizer[dx] = this.pos - 1

  //     this.resizer.w = this.w
  //     this.resizer.h = this.h
  //     this.resizer[dw] = 2
  //   }

  //   this.children[0].x = a.x
  //   this.children[0].y = a.y
  //   this.children[0].w = a.w
  //   this.children[0].h = a.h
  //   this.children[1].x = b.x
  //   this.children[1].y = b.y
  //   this.children[1].w = b.w
  //   this.children[1].h = b.h
  // }

}

export class splitx extends split {
  override dir = 'x' as const
}

export class splity extends split {
  override dir = 'y' as const
}
