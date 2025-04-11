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
