import { PanelInfo } from "./rpc.js"
import { Point, Size } from "./types.js"

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


export class BC<T extends { type: string }> {

  private chan

  constructor(channel: string, public pid: string) {
    this.chan = new BroadcastChannel(channel)
  }

  emit(event: T) {
    this.chan.postMessage([this.pid, event])
  }

  handle(fn: (event: T) => void) {
    this.chan.onmessage = msg => {
      const [pid, event] = msg.data
      if (pid === this.pid) {
        fn(event)
      }
    }
  }

}
