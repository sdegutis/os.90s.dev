import initSwc, { transformSync } from "./wasm.js"

await initSwc()

export function compile(tsx: string) {
  return transformSync(tsx, {
    isModule: true,
    module: {
      type: 'systemjs'
    },
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/@imlib/jsx-browser.js',
        },
      }
    }
  }).code
}
