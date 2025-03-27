import initSwc, { transformSync } from "/swc/wasm.js"

await initSwc()

export async function exec(tsx: string) {
  const fn = new Function('System', compile(tsx))
  fn(sysjs)
}

function compile(tsx: string) {
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

const sysjs = {
  register: async (deps: string[], fn: (exp: (k: string, v: any) => void, ctx: any) => {
    setters: ((dep: any) => void)[],
    execute: () => Promise<any>,
  }) => {
    const imps = await Promise.all(deps.map(dep => import(dep)))
    const { setters, execute } = fn((k, v) => {

    }, {})
    for (let i = 0; i < imps.length; i++) {
      setters[i](imps[i])
    }
    await execute()
  }
}
