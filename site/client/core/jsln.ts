class JSLNParser {

  private str

  constructor(str: string) {
    this.str = str
  }

  parse() {
    const root = {}



    return root
  }

}

export class JSLN {

  static parse(str: string) {
    return new JSLNParser(str).parse()
  }

  static stringify(o: Record<string, any>) {

  }

}

console.log(JSLN.parse(`
  compilerOptions.lib[]="esnext"
  compilerOptions.lib[]="dom"
  compilerOptions.lib[]="dom.iterable"
  compilerOptions.types[]="node"
  #comment
colors[]=0x000000ff
colors[]=0x0000007f
colors[]=0x00000001
colors[]=0x00000009
colors[]=0x00000010
colors[]=0x0000001f
colors[]=0x00000020
pixels = 
===
yesfasdf
asdff
df
===
compilerOptions.moduleDetection="force"
compilerOptions.paths."/api.js"[]="./site.api.js"
`.trimStart()))
