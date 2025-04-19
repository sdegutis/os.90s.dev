import { $ } from "../core/ref.js"
import { pobject } from "./kvs.js"
import { GET } from "./net.js"

export type UserStateGuest = {
  type: 'guest'
}

export type UserStateRegistering = {
  type: 'registering'
  username: string
}

export type UserStateVerifying = {
  type: 'verifying'
  username: string
}

export type UserStateKnown = {
  type: 'known'
  username: string
}

export type UserState =
  | UserStateGuest
  | UserStateRegistering
  | UserStateVerifying
  | UserStateKnown

export const $userState = $<UserState>({ type: 'guest' })

const persisted = await pobject<UserState>('accountinfo')
await persisted.get().then(state => {
  if (state) $userState.val = state
})

export async function updateAccountFromServer() {
  await GET('/user/info').then(async ([err, state]) => {
    // console.log('here', err, state)
    if (err) {
      console.error(err)
      return
    }

    if (state) {
      $userState.val = {
        type: state.verified ? 'known' : 'verifying',
        username: state.username,
      }
    }
    else {
      $userState.val = { type: 'guest' }
    }
    await persisted.set($userState.val)
  })
}

// setInterval(updateAccountFromServer, 1000 * 60)

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
