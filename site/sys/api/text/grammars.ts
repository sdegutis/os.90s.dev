import { LangGrammar } from "./highlighter.js"

const jslnGrammar: LangGrammar = {
  'start': [
    [/[a-zA-Z0-9_]+/, 'key'],
    [/\./, 'punc'],
    [/=/, ['punc', '@push(val)']],
    [/#/, ['comment', 'comment']],
    [/\[\]/, 'key'],
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

const txtGrammar: LangGrammar = {
  'start': [
    [/^\s*""/, ['quote', '@push(quote)']],
    [/^\s*> /, ['codeblock', '@push(codeblock)']],
    [/^\s*#/, ['header', '@push(header)']],
    [/^\s*={3,}/, ['header', '@push(header)']],
    [/^\s*-{3,}/, ['header', '@push(header)']],
    [/\*.+?\*/, 'bold'],
    [/\[\[.+?\](\(.+?\))?\]/, 'link'],
    [/\/.+?\//, 'italic'],
    [/>.+?</, 'code'],
    [/./, 'text'],
  ],
  'header': [
    [/^/, ['', '@pop()']],
    [/\*.+?\*/, 'headerbold'],
    [/./, 'header'],
  ],
  'quote': [
    [/^/, ['', '@pop()']],
    [/./, 'quote'],
  ],
  'codeblock': [
    [/^/, ['', '@pop()']],
    [/./, 'codeblock'],
  ],
}

export const langGrammars = {
  jslnGrammar,
  txtGrammar,
}
