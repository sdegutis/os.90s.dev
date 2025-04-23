import { BC } from "../core/bc.js"
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
  if (state) $userState.$ = state
})

export async function updateAccountFromServer() {
  await GET('/user/info').then(async ([err, state]) => {
    // console.log('here', err, state)
    if (err) {
      console.error(err)
      return
    }

    if (state) {
      $userState.$ = {
        type: state.verified ? 'known' : 'verifying',
        username: state.username,
      }
    }
    else {
      $userState.$ = { type: 'guest' }
    }
    await persisted.set($userState.$)
  })
}

// setInterval(updateAccountFromServer, 1000 * 60)

type UserStateEvent = { type: 'sync', state: UserState }

const b = new BC<UserStateEvent>('userstate', null)
let syncing = false

b.handle(data => {
  syncing = true
  $userState.$ = data.state
  syncing = false
})

$userState.watch(state => {
  if (syncing) return
  b.emit({ type: 'sync', state })
  persisted.set(state)
})
