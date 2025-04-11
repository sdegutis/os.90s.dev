import { Listener } from "../core/listener.js"
import { makeRef } from "../core/ref.js"

export class TextModel {

  colors: Record<string, number> = {}
  labels!: string[][]
  lines!: string[]

  cursors: TextCursor[] = [new TextCursor()]

  onCursorsChanged = new Listener()
  onTextChanged = new Listener()
  onLineChanged = new Listener<number>()

  constructor(initialText = '') {
    this.setText(initialText)
  }

  getText() {
    return this.lines.join('\n')
  }

  setText(s: string) {
    this.lines = s.split('\n')
    this.labels = this.lines.map(line => Array(line.length).fill(''))
    this.onTextChanged.dispatch()
  }

  insert(text: string) {
    this.cursors.forEach(c => {
      const [a, b] = this.halves(c)
      this.lines[c.row] = a + text + b
      c.col++
      c.end = c.col
      this.onLineChanged.dispatch(c.row)
    })
  }

  moveCursorsRight(selecting = false) {
    this.doMove(selecting, c => {
      if (c.col < this.lines[c.row].length) {
        c.end = c.col = c.col + 1
      }
      else if (c.row < this.lines.length - 1) {
        c.col = c.end = 0
        c.row++
      }
    })
  }

  private doMove(selecting: boolean, fn: (c: TextCursor) => void) {
    this.cursors.forEach(c => {
      c.noteSelecting(selecting)
      fn(c)
    })
    this.rebuildRanges()
  }

  private halves(c: TextCursor) {
    let line = this.lines[c.row]
    const first = line.slice(0, c.col)
    const last = line.slice(c.col)
    return [first, last] as const
  }

  ranges: any[] = []

  private rebuildRanges() {
    // this.cursors
    //   .filter(c => c.begin !== undefined)
    //   .map(c => c.begin)
  }

}

type Pos = { col: number, row: number }

export class TextCursor {

  begin: Pos | undefined

  row = 0; $row = makeRef(this, 'row')
  col = 0; $col = makeRef(this, 'col')
  end = 0; $end = makeRef(this, 'end')

  noteSelecting(selecting: boolean) {
    if (!this.begin && selecting) {
      this.begin = { col: this.col, row: this.row }
    }
    else if (this.begin && !selecting) {
      this.begin = undefined
    }
  }

}
