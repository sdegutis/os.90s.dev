import { Listener } from "../core/listener.js"
import { makeRef } from "../core/ref.js"

class Span {

  text: string
  state: string
  meta?: string | undefined

  constructor(text: string, state: string, meta?: string) {
    this.text = text
    this.state = state
    this.meta = meta
  }

}

class Line {

  text!: string
  spans!: Span[]
  endState?: string | undefined

  constructor(text: string, endState?: string) {
    this.setText(text)
    this.endState = endState
  }

  setText(text: string) {
    this.text = text
    this.spans = [new Span(text, '')]
    this.endState = undefined
  }

}

export class TextModel {

  highlighter?: Highlighter | undefined

  lines: Line[] = [new Line('')]
  cursors: TextCursor[] = [new TextCursor()]

  onCursorsChanged = new Listener()
  onCursorsMoved = new Listener()
  onTextChanged = new Listener()

  constructor(initialText = '') {
    this.setText(initialText)
  }

  getText() {
    return this.lines.join('\n')
  }

  setText(s: string) {
    this.lines = s.split('\n').map(str => new Line(str))

    this.doMove(false, c => {
      c.row = Math.min(c.row, this.lines.length - 1)
    })

    this.rehighlight(0)
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
      this.lines[c.row].setText(a + ch + b)
      c.col++
      c.end = c.col
      this.rehighlight(c.row)
    })
  }

  insertTab() {
    this.editWithCursors(c => {
      const [a, b] = this.halves(c)
      this.lines[c.row].setText(a + '  ' + b)
      c.col += 2
      c.end = c.col
      this.rehighlight(c.row)
    })
  }

  insertNewline() {
    this.editWithCursors(c => {
      const [a, b] = this.halves(c)
      const ender = this.lines[c.row].endState
      this.lines[c.row].setText(a)
      this.lines.splice(++c.row, 0, new Line(b, ender))
      this.pushCursorsAfter(c, c.row, 1)
      c.end = c.col = 0
      this.rehighlight(c.row - 1)
    })
  }

  delete() {
    this.editWithCursors(c => {
      if (c.col < this.lines[c.row].text.length) {
        const [a, b] = this.halves(c)
        this.lines[c.row].setText(a + b.slice(1))
      }
      else if (c.row < this.lines.length - 1) {
        this.lines[c.row].setText(this.lines[c.row].text + this.lines[c.row + 1].text)
        this.lines.splice(c.row + 1, 1)
        this.pushCursorsAfter(c, c.row + 1, -1)
      }
      this.rehighlight(c.row)
    })
  }

  backspace() {
    this.editWithCursors(c => {
      if (c.col > 0) {
        const [a, b] = this.halves(c)
        if (a === ' '.repeat(a.length) && a.length >= 2) {
          this.lines[c.row].setText(a.slice(0, -2) + b)
          c.col -= 2
          c.end = c.col
        }
        else {
          this.lines[c.row].setText(a.slice(0, -1) + b)
          c.col--
          c.end = c.col
        }
      }
      else if (c.row > 0) {
        c.end = this.lines[c.row - 1].text.length
        this.lines[c.row - 1].setText(this.lines[c.row - 1].text + this.lines[c.row].text)
        this.lines.splice(c.row, 1)
        this.pushCursorsAfter(c, c.row, -1)
        c.row--
        c.col = c.end
      }
      this.rehighlight(c.row)
    })
  }

  private pushCursorsAfter(init: TextCursor, row: number, linesDown: number) {
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
    this.onTextChanged.dispatch()
  }

  moveCursorTo(row: number, col: number, selecting = false) {
    this.removeExtraCursors()
    this.doMove(selecting, c => {
      c.row = Math.min(row, this.lines.length - 1)
      c.end = c.col = col
      this.fixCursorCol(c)
    })
  }

  moveCursorsRight(selecting = false) {
    this.doMove(selecting, c => {
      if (c.col < this.lines[c.row].text.length) {
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
        c.end = c.col = this.lines[c.row].text.length
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
      const firstNonSpace = this.lines[c.row].text.match(/[^\s]/)?.index ?? 0
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
      c.end = c.col = this.lines[c.row].text.length
    })
  }

  moveToEndOfDocument(selecting = false) {
    this.doMove(selecting, c => {
      c.row = this.lines.length - 1
      c.col = c.end = this.lines[c.row].text.length
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
    c.col = Math.min(this.lines[c.row].text.length, c.end)
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
    const first = line.text.slice(0, c.col)
    const last = line.text.slice(c.col)
    return [first, last] as const
  }

  // ranges: any[] = []

  private rebuildRanges() {
    // this.cursors
    //   .filter(c => c.begin !== undefined)
    //   .map(c => c.begin)
  }

  private rehighlight(row: number) {
    if (!this.highlighter) return
    const hl = this.highlighter

    let states: string[] = [
      this.stateBefore(row)
    ]

    while (row < this.lines.length) {
      const line = this.lines[row]
      const spans: Span[] = []

      nextToken:
      for (let pos = 0; pos < line.text.length;) {
        const state = states.at(-1)!
        const ruleset = hl.rules[state]
        if (!ruleset) {
          if (hl.log) console.log('NO RULESET', state)
          spans.push(new Span(line.text.slice(pos), state))
          break
        }
        for (const { test, action } of ruleset) {
          test.lastIndex = pos
          if (hl.log) console.log('try', [row, pos, state, line.text.slice(pos), test])
          const match = test.exec(line.text)
          if (match) {
            if (hl.log) console.log('MATCH', action, match)
            spans.push(new Span(match[0], action.token))
            if (action.next !== undefined) {
              let match
              if (action.next === '@pop()') {
                if (hl.log) console.log('POP STATE')
                states.pop()
              }
              else if (match = action.next.match(/^@push\((.+?)\)$/)) {
                if (hl.log) console.log('PUSH STATE', [match[1]])
                states.push(match[1])
              }
              else {
                if (hl.log) console.log('REPLACE STATE', [action.next])
                states[states.length - 1] = action.next
              }
            }
            pos = test.lastIndex
            continue nextToken
          }
        }

        if (hl.log) console.log('NO MATCH :\'(', [row, pos, line.text.slice(pos)])
        states[states.length - 1] = ''
        spans.push(new Span(line.text.slice(pos), 'error'))
        break
      }

      const endStates = JSON.stringify(states)
      const needMoreLines = line.endState !== endStates
      if (hl.log) console.log('NEED MORE LINES?', [row, endStates, line.endState])

      line.endState = endStates
      line.spans = spans

      if (!needMoreLines) break
      row++
    }

    if (hl.log) console.log(`DONE HIGHLIGHTING ${Date.now()}\n\n`)
  }

  private stateBefore(row: number) {
    if (row === 0) return ''
    return JSON.parse(this.lines[row - 1].endState!)
  }

  highlightDocument() {
    this.rehighlight(0)
  }

}

export class Highlighter {

  log = false
  colors: Record<string, number>
  rules: Record<string, Rule[]> = {}

  constructor(
    colors: Record<string, number>,
    rules: Record<string, ConvenientRule[]>,
  ) {
    this.colors = colors
    for (const [key, ruleset] of Object.entries(rules)) {
      this.rules[key] = ruleset.map(([test, action]) => ({
        test: new RegExp(test, 'gy'),
        action: typeof action === 'string'
          ? { token: action }
          : action instanceof Array
            ? { token: action[0], next: action[1] }
            : action,
      }))
    }
  }

}

type Rule = {
  test: RegExp,
  action: { token: string, next?: string },
}

type ConvenientRule = [
  test: RegExp | string,
  action: string | [string, string] | { token: string, next?: string },
]

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
