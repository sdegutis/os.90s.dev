import { sysConfig } from "./config.js"

const init = Promise.withResolvers<void>()

export const appReady = init.promise

async function loadPreludes() {
  for (const path of sysConfig.prelude ?? []) {
    try {
      await import('/fs/' + path)
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
