import { sysConfig } from "./config.js"
import { runJsFile } from "./open.js"

const init = Promise.withResolvers<void>()

/** Resolves when all preludes have run. */
export const appReady = init.promise

async function loadPreludes() {
  for (const path of sysConfig.prelude ?? []) {
    try {
      await runJsFile(path)
    }
    catch (e) {
      console.error(`Prelude failed:`, path)
    }
  }
}

async function setup() {
  await loadPreludes()
  init.resolve()
}

setup()
