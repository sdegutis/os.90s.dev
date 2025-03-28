import initSwc, { transformSync } from "./wasm.js"

const ready = initSwc()

export async function compile(tsx: string) {
  await ready
  const transformed = transformSync(tsx, {
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
  }).code
  return transformed.replace('/@imlib/jsx-runtime', '/client/jsx.js')
}
