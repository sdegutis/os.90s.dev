import initSwc, { transformSync } from "/swc/wasm.js"

await initSwc()

export function compile(tsx: string) {
  return transformSync(tsx, {
    isModule: true,
    module: {
      type: 'es6'
    },
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/@imlib',
        },
      }
    }
  }).code
}
