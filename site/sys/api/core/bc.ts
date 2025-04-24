import { PanelInfo } from "./rpc.js"
import { Point, Size } from "./types.js"

export type SysEvent =
  | { type: 'resized', size: [w: number, h: number] }
  | { type: 'desktop', desktop: Point & Size }

export type KeyEvent =
  | { type: 'keydown', key: string }
  | { type: 'keyup', key: string }

export type ProcEvent =
  | { type: 'started', pid: number, path: string }
  | { type: 'init', pid: number }
  | { type: 'ended', pid: number }

export type PanelEvent =
  | { type: 'new' } & PanelInfo
  | { type: 'focused', id: number }
  | { type: 'renamed', id: number, name: string }
  | { type: 'closed', id: number }
  | { type: 'toggled', id: number, visible: boolean }
  | { type: 'adjusted', id: number, point: Point, size: Size }


/** Wraps `BroadcastChannel` to the given sysid, unique per user-agent (e.g. tab) */
export class BC<T extends { type: string }> {

  private chan

  constructor(channel: string, public sysid: string | null) {
    this.chan = new BroadcastChannel(channel)
  }

  emit(event: T) {
    this.chan.postMessage([this.sysid, event])
  }

  handle(fn: (event: T) => void) {
    this.chan.addEventListener('message', msg => {
      const [id, event] = msg.data
      if (this.sysid === null || id === this.sysid) {
        fn(event)
      }
    })
  }

  close() {
    this.chan.close()
  }

}
