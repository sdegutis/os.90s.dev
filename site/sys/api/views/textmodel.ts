import { Listener } from "../core/listener.js"
import { makeRef } from "../core/ref.js"

export class TextModel {

  colors: Record<string, number> = {}
  labels: string[][] = []
  lines: string[] = ['']

  cursors: TextCursor[] = [new TextCursor()]

  onCursorsChanged = new Listener()
  onCursorsMoved = new Listener()
  onLineChanged = new Listener<number>()

  constructor(initialText = '') {
    this.setText(initialText)
  }

  getText() {
    return this.lines.join('\n')
  }

  setText(s: string) {
    this.lines = s.split('\n')
    this.labels = this.lines.map(line => [])

    this.doMove(false, c => {
      c.row = Math.min(c.row, this.lines.length - 1)
    })

    this.onLineChanged.dispatch(0)
  }

  insertText(text: string) {
    for (const ch of Array.from(text)) {
      if (ch === '\n') {
        this.insertNewline()
      }
      else if (ch === '\r') {
        // no
      }
      else if (ch === '\t') {
        this.insertTab()
      }
      else {
        this.insertChar(ch)
      }
    }
  }

  insertChar(ch: string) {
    this.editWithCursors(c => {
      const [a, b] = this.halves(c)
      this.lines[c.row] = a + ch + b
      c.col++
      c.end = c.col
      this.onLineChanged.dispatch(c.row)
    })
  }

  insertTab() {
    this.editWithCursors(c => {
      const [a, b] = this.halves(c)
      this.lines[c.row] = a + '  ' + b
      c.col += 2
      c.end = c.col
      this.onLineChanged.dispatch(c.row)
    })
  }

  insertNewline() {
    this.editWithCursors(c => {
      const [a, b] = this.halves(c)
      this.lines[c.row] = a
      this.lines.splice(++c.row, 0, b)
      this.labels.splice(c.row, 0, [])
      this.moveCursorsAfter(c, c.row, 1)
      c.end = c.col = 0
      this.onLineChanged.dispatch(c.row - 1)
    })
  }

  delete() {
    this.editWithCursors(c => {
      if (c.col < this.lines[c.row].length) {
        const [a, b] = this.halves(c)
        this.lines[c.row] = a + b.slice(1)
        this.onLineChanged.dispatch(c.row)
      }
      else if (c.row < this.lines.length - 1) {
        this.lines[c.row] += this.lines[c.row + 1]
        this.lines.splice(c.row + 1, 1)
        this.labels.splice(c.row + 1, 1)
        this.moveCursorsAfter(c, c.row + 1, -1)
        this.onLineChanged.dispatch(c.row + 1)
      }
    })
  }

  backspace() {
    this.editWithCursors(c => {
      if (c.col > 0) {
        const [a, b] = this.halves(c)
        if (a === ' '.repeat(a.length) && a.length >= 2) {
          this.lines[c.row] = a.slice(0, -2) + b
          c.col -= 2
          c.end = c.col
        }
        else {
          this.lines[c.row] = a.slice(0, -1) + b
          c.col--
          c.end = c.col
        }
      }
      else if (c.row > 0) {
        c.end = this.lines[c.row - 1].length
        this.lines[c.row - 1] += this.lines[c.row]
        this.lines.splice(c.row, 1)
        this.labels.splice(c.row, 1)
        this.moveCursorsAfter(c, c.row, -1)
        c.row--
        c.col = c.end
      }
      this.onLineChanged.dispatch(c.row)
    })
  }

  private moveCursorsAfter(init: TextCursor, row: number, linesDown: number) {
    this.cursors.forEach(c => {
      if (c === init) return
      if (c.row >= row) {
        c.row += linesDown
        this.fixCursorCol(c)
      }
    })
  }

  private editWithCursors(fn: (c: TextCursor) => void) {
    this.cursors.forEach(fn)
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

  moveCursorsLeft(selecting = false) {
    this.doMove(selecting, c => {
      if (c.col > 0) {
        c.end = c.col = c.col - 1
      }
      else if (c.row > 0) {
        c.row--
        c.end = c.col = this.lines[c.row].length
      }
    })
  }

  moveCursorsDown(selecting = false) {
    this.doMove(selecting, c => {
      c.row = Math.min(c.row + 1, this.lines.length - 1)
      this.fixCursorCol(c)
    })
  }

  moveCursorsUp(selecting = false) {
    this.doMove(selecting, c => {
      c.row = Math.max(0, c.row - 1)
      this.fixCursorCol(c)
    })
  }

  moveToBeginningOfLine(selecting = false) {
    this.doMove(selecting, c => {
      const firstNonSpace = this.lines[c.row].match(/[^\s]/)?.index ?? 0
      if (c.col !== firstNonSpace) {
        c.end = c.col = firstNonSpace
      }
      else {
        c.end = c.col = 0
      }
    })
  }

  moveToBeginningOfDocument(selecting = false) {
    this.doMove(selecting, c => {
      c.row = 0
      c.end = c.col = 0
    })
  }

  moveToEndOfLine(selecting = false) {
    this.doMove(selecting, c => {
      c.end = c.col = this.lines[c.row].length
    })
  }

  moveToEndOfDocument(selecting = false) {
    this.doMove(selecting, c => {
      c.row = this.lines.length - 1
      c.col = c.end = this.lines[c.row].length
    })
  }

  addCursorAbove() {
    const last = this.cursors.at(-1)!
    if (last.row === 0) return

    const next = new TextCursor(last.row - 1, last.col, last.end)
    this.fixCursorCol(next)
    this.cursors.push(next)
    this.onCursorsChanged.dispatch()
  }

  addCursorBelow() {
    const last = this.cursors.at(-1)!
    if (last.row === this.lines.length - 1) return

    const next = new TextCursor(last.row + 1, last.col, last.end)
    this.fixCursorCol(next)
    this.cursors.push(next)
    this.onCursorsChanged.dispatch()
  }

  removeExtraCursors() {
    this.cursors = [this.cursors[0]]
    this.onCursorsChanged.dispatch()
  }

  private fixCursorCol(c: TextCursor) {
    c.col = Math.min(this.lines[c.row].length, c.end)
  }

  private doMove(selecting: boolean, fn: (c: TextCursor) => void) {
    this.cursors.forEach(c => {
      c.noteSelecting(selecting)
      fn(c)
    })
    this.rebuildRanges()
    this.onCursorsMoved.dispatch()
  }

  private halves(c: TextCursor) {
    let line = this.lines[c.row]
    const first = line.slice(0, c.col)
    const last = line.slice(c.col)
    return [first, last] as const
  }

  // ranges: any[] = []

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

  constructor(row = 0, col = 0, end = 0) {
    this.row = row
    this.col = col
    this.end = end
  }

  noteSelecting(selecting: boolean) {
    if (!this.begin && selecting) {
      this.begin = { col: this.col, row: this.row }
    }
    else if (this.begin && !selecting) {
      this.begin = undefined
    }
  }

}
