import { $ } from "../core/ref.js"
import { GET } from "./net.js"

type GuestState = {
  type: 'guest'
}

type VerifyingState = {
  type: 'verifying'
  username: string
  email: string
}

type KnownState = {
  type: 'known'
  username: string
  email: string
  publishes: boolean
}

type State = GuestState | VerifyingState | KnownState
const $state = $<State>({ type: 'guest' })


// const accountinfo = await kvsMap<{ state: State }>('accountinfo')

// const maybeState = await accountinfo.get('state')
// if (maybeState) $state.val = maybeState



GET('/user/info').then(info => {
  console.log({ info })
})
