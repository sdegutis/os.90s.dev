import { $usrConfig } from "./config.js"
import { as } from "./typesafe.js"

const init = Promise.withResolvers<void>()

/** Resolves when all preludes have run. */
export const preludesFinished = init.promise

async function loadPreludes() {
  const preludes = as($usrConfig.val, 'process.prelude', as.strings())
  for (const path of preludes ?? []) {
    try {
      await import('/os/fs/' + path)
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
