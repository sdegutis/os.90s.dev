import { Listener } from "../core/listener.js"

export class TextModel {

  colors: Record<string, number> = {}
  labels: string[][] = []
  lines: string[] = ['']

  private row = 0
  private col = 0
  private end = 0

  linesChanged = new Listener()

  constructor(initialText = '') {
    if (initialText) {
      this.setText(initialText)
    }
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
