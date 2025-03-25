import initSwc, { transformSync } from 'https://esm.sh/@swc/wasm-web'

await initSwc()

export function testCompile() {

  console.log('test', transformSync('const a:number = <foo>33</foo>', {
    isModule: true,
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/foo',
        },
      }
    }
  }).code)

}
