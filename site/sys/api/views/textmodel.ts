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

  private halves(c: TextCursor) {
    let line = this.lines[c.row]
    const first = line.slice(0, c.col)
    const last = line.slice(c.col)
    return [first, last] as const
  }

}

export class TextCursor {

  row = 0; $row = makeRef(this, 'row')
  col = 0; $col = makeRef(this, 'col')
  end = 0; $end = makeRef(this, 'end')

}
