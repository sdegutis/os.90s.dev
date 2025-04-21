import { sys } from "./sys.js"

export function print(...args: any[]) {
  sys.sendToEmbedHost(args)
}
