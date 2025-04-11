import { TextModel, TextSpan } from "./model.js"

export type LangTheme = Record<string, number>
export type LangGrammar = Record<string, ConvenientRule[]>

export class Highlighter {

  log
  colors: LangTheme
  rules: Record<string, Rule[]> = {}

  constructor(colors: LangTheme, rules: LangGrammar, log = false) {
    this.log = log
    this.colors = colors

    for (const [key, ruleset] of Object.entries(rules)) {
      this.rules[key] = ruleset.map(([test, action]) => {
        test = new RegExp(test, 'gy')

        if (typeof action === 'string') action = { token: action }
        else if (action instanceof Array) action = { token: action[0], next: action[1] }

        let next: Next | undefined
        let match
        if (action.next === '@pop()')
          next = { action: 'pop' }
        else if (match = action.next?.match(/^@push\((.+?)\)$/))
          next = { action: 'push', state: match[1] }
        else if (action.next)
          next = { action: 'replace', state: action.next }

        return { test, action: { token: action.token, next } }
      })
    }
  }

  highlight(model: TextModel, row: number) {
    const states: string[] = (row === 0)
      ? [Object.keys(this.rules)[0]]
      : model.lines[row - 1].endState!.split('.')

    while (row < model.lines.length) {
      const line = model.lines[row]
      const spans: TextSpan[] = []

      if (this.log) console.log('\n%crow: %d',
        'border-left:7em solid #19f; padding-left:1em',
        row)

      nextToken:
      for (let pos = 0; pos < line.text.length;) {
        const state = states.at(-1)!
        const ruleset = this.rules[state]
        if (!ruleset) {
          if (this.log) console.log('no ruleset named:', state)
          spans.push(new TextSpan(line.text.slice(pos), state))
          break
        }
        if (this.log) console.log('%c state[\x1b[35m%s\x1b[0m] pos[\x1b[34m%d\x1b[0m] input[\x1b[34;40m%s\x1b[0m]',
          'border-left:3em solid #19f; padding-left:1em',
          states.join(','), pos, line.text.slice(pos))
        for (const { test, action } of ruleset) {
          test.lastIndex = pos
          if (this.log) console.log('try', test)
          const match = test.exec(line.text)
          if (match) {
            if (this.log) console.log('\x1b[32m%s\x1b[0m', 'match', action, match)
            spans.push(new TextSpan(match[0], action.token))
            if (action.next) {
              if (action.next.action === 'pop') {
                if (this.log) console.log('\x1b[33m%s\x1b[0m', '@pop()')
                states.pop()
              }
              else if (action.next.action === 'push') {
                if (this.log) console.log('\x1b[33m%s\x1b[0m', `@push(${action.next.state})`)
                states.push(action.next.state)
              }
              else {
                if (this.log) console.log('\x1b[33m%s\x1b[0m', `@replace(${action.next.state})`)
                states[states.length - 1] = action.next.state
              }
            }
            pos = test.lastIndex
            continue nextToken
          }
        }

        if (this.log) console.log('\x1b[31m%s\x1b[0m', 'no match :\'(')
        spans.push(new TextSpan(line.text.slice(pos), 'error'))
        break
      }


      const endStates = states.join('.')
      const needMoreLines = line.endState !== endStates

      line.endState = endStates
      line.spans = spans

      if (!needMoreLines) break
      row++
    }

    if (this.log) console.log(`done highlighting ${Date.now()}\n\n\n`)
  }

}

type Next =
  | { action: 'replace', state: string }
  | { action: 'push', state: string }
  | { action: 'pop' }

type Action = { token: string, next?: Next | undefined }
type Rule = { test: RegExp, action: Action }

type ConvenientRule = [
  test: RegExp | string,
  action: string | [string, string] | { token: string, next?: string },
]
