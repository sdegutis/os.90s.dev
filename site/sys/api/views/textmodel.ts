import { Listener } from "../core/listener.js"
import { makeRef } from "../core/ref.js"

export class TextModel {

  colors: Record<string, number> = {}
  labels!: string[][]
  lines!: string[]

  cursors: TextCursor[] = [new TextCursor()]

  cursorsChanged = new Listener()
  linesChanged = new Listener()

  constructor(initialText = '') {
    this.setText(initialText)
  }

  getText() {
    return this.lines.join('\n')
  }

  setText(s: string) {
    this.lines = s.split('\n')
    this.labels = this.lines.map(line => Array(line.length).fill(''))
    this.linesChanged.dispatch()
  }

}

export class TextCursor {

  row = 0; $row = makeRef(this, 'row')
  col = 0; $col = makeRef(this, 'col')
  end = 0; $end = makeRef(this, 'end')

}
