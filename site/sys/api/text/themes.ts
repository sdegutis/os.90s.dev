import { LangTheme } from "./highlighter.js"

const theme1: LangTheme = {
  key: 0xff00ff99,
  punc: 0xffffff33,

  quote: 0xffff00ff,
  string: 0xff9900ff,
  escape: 0xff99ffff,

  number: 0x0099ffff,
  literal: 0x00ff99ff,

  comment: 0x009900ff,
  error: 0x990000ff,
}

const ftfTheme1: LangTheme = {
  text: 0x777777ff,
  comment: 0x00990077,
  error: 0x990000ff,
  bold: 0xffffffff,
  header: 0xff9900ff,
  headerbold: 0xffff00ff,
  italic: 0xffff9999,
  link: 0x0099ff99,
  quote: 0x9999ff99,
  code: 0xff99ff99,
  codeblock: 0x00990099,
}

export const langThemes = {
  theme1,
  ftfTheme1,
}
