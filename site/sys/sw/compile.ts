import initSwc, { transformSync } from "./wasm.js"

const ready = initSwc()

export async function compile(url: URL, tsx: string) {
  await ready
  const transformed = transformSync(tsx, {
    sourceMaps: 'inline',
    minify: true,
    filename: url.pathname,
    isModule: true,
    jsc: {
      externalHelpers: false,
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true },
      transform: {
        react: {
          runtime: 'automatic',
          importSource: '/FAKEIMPORT',
        },
      }
    }
  }).code
  return transformed.replace('/FAKEIMPORT/jsx-runtime', '/sys/api/jsx.js')
}
