import { LangGrammar } from "./highlighter.js"

const jslnGrammar: LangGrammar = {
  'start': [
    [/[a-zA-Z0-9_]+/, 'key'],
    [/\./, 'punc'],
    [/=/, ['punc', '@push(val)']],
    [/#/, ['comment', 'comment']],
    [/[ \t]+/, ''],
  ],
  'comment': [
    [/^/, ['', 'start']],
    [/.+/, 'comment'],
  ],
  'val': [
    [/^/, ['', '@pop()']],
    [/\[/, ['quote', '@push(array)']],
    [/(\btrue\b|\bfalse\b|\bnull\b)/, ['literal', '@pop()']],
    [/0x[0-9a-fA-F]+/, ['number', 'start']],
    [/[0-9]+/, ['number', 'start']],
    [/["']/, ['quote', '@push(string)']],
    [/[ \t]+/, ''],
  ],
  'array': [
    [/^/, ['error', 'error']],
    [/,/, 'punc'],
    [/\[/, ['quote', '@push(array)']],
    [/\]/, ['quote', '@pop()']],
    [/(\btrue\b|\bfalse\b|\bnull\b)/, 'literal'],
    [/[a-zA-Z]+/, 'error'],
    [/0x[0-9a-fA-F]+/, 'number'],
    [/[0-9]+/, 'number'],
    [/[ \t]+/, ''],
  ],
  'string': [
    [/\\["rnt]/, 'escape'],
    [/\\./, 'error'],
    [/[^"]+$/, ['error', 'error']],
    [/"/, ['quote', '@pop()']],
    [/[^\\"]+/, 'string'],
  ],
}

export const langGrammars = {
  jslnGrammar,
}
