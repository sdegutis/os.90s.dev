import initSwc, { transformSync } from "/swc/wasm.js"

const ready = initSwc()

export async function compile(tsx: string) {
  await ready
  return transformSync(tsx, {
    isModule: true,
    jsc: {
      externalHelpers: false,
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/@imlib',
        },
      }
    }
  }).code.replace('/@imlib/jsx-runtime', '/jsx.js')
}
