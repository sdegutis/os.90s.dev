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

export const langThemes = {
  theme1,
}
