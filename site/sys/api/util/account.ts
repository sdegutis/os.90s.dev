import { $ } from "../core/ref.js"
import { pobject } from "./kvs.js"
import { GET } from "./net.js"

export type GuestState = {
  type: 'guest'
}

export type VerifyingState = {
  type: 'verifying'
  username: string
  email: string
  publishes: false
}

export type KnownState = {
  type: 'known'
  username: string
  email: string
  publishes: boolean
}

export type State =
  | GuestState
  | VerifyingState
  | KnownState

export const $userState = $<State>({ type: 'guest' })

const persisted = await pobject<State>('_persisted')
await persisted.get().then(state => {
  if (state) $userState.val = state
})

async function updateFromServerNow() {
  console.log('here')
  await GET('/user/info').then(async ([err, state]) => {
    if (err) {
      console.error(err)
      return
    }

    if (state) {
      $userState.val = {
        type: state.verified ? 'known' : 'verifying',
        username: state.username,
        email: state.email,
        publishes: state.publishes,
      }
    }
    else {
      $userState.val = { type: 'guest' }
    }
    await persisted.set($userState.val)
  })
}

export function updateAccountFromServer() {
  updateFromServerNow()
  setInterval(updateFromServerNow, 1000 * 60)
}

const b = new BroadcastChannel('userstate')
let syncing = false

b.onmessage = msg => {
  syncing = true
  $userState.val = msg.data
  syncing = false
}

$userState.watch(state => {
  if (syncing) return
  b.postMessage(state)
  persisted.set(state)
})
