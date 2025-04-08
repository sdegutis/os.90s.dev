import * as api from '/api.js'

async function POST(path: string, data: string) {
  return fetch(api.config.net + path, {
    method: 'post',
    body: data,
    credentials: 'include',
  }).then(r => r.json())
}

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
}

type State = GuestState | VerifyingState | KnownState
const $state = api.$<State>({ type: 'guest' })


// const userinfo = await api.opendb<{ key: string, val: any }>('userinfo', 'key')
// const maybeUser = await userinfo.get('username')
// if (maybeUser) $state.val = {kn}



function makeTextField(data: {
  textbox?: api.JsxAttrs<api.TextBox>,
  border?: api.JsxAttrs<api.Border>,
  scroll?: api.JsxAttrs<api.Scroll>,
  length?: number,
}) {

  const length = data.length ?? 50

  const textbox: api.TextBox = <api.TextBox
    multiline={false}
    {...data.textbox} />

  const border: api.Border = <api.Border
    padding={2}
    children={[textbox]}
    {...data.border} />

  const scroll = <api.Scroll
    showh={false}
    showv={false}
    background={0x00000033}
    onMouseDown={function (...args) { textbox.onMouseDown(...args) }}
    onMouseMove={function (...args) { textbox.onMouseMove(...args) }}
    $size={border.$size.adapt(s => ({ w: length, h: border.$size.val.h }))}
    children={[border]}
    {...data.scroll} />

  return { scroll, border, textbox }

}



function SigninView() {
  const $error = api.$('')

  const userField = makeTextField({
    textbox: { onEnter: create, autofocus: true },
    border: { padding: 2 },
  })

  const emailField = makeTextField({
    textbox: { onEnter: create },
    border: { padding: 2 },
  })

  async function create() {
    const username = userField.textbox.text
    if (!username) { userField.textbox.focus(); return }

    const email = emailField.textbox.text
    if (!email) { emailField.textbox.focus(); return }

    const [ok, err] = await POST('/user/new', `${username} ${email}`)
    if (!ok) {
      $error.val = err
      return
    }

    $state.val = { type: 'verifying', username, email }
  }

  return <api.Center>
    <api.GroupY gap={4}>

      <api.GroupX>

        <api.GroupY gap={2}>
          <api.Border padding={2}><api.Label textColor={0xffffff33} text='username' /></api.Border>
          <api.Border padding={2}><api.Label textColor={0xffffff33} text='email' /></api.Border>
        </api.GroupY>

        <api.GroupY gap={2}>
          {userField.scroll}
          {emailField.scroll}
        </api.GroupY>

      </api.GroupX>

      <api.Button padding={2} onClick={create}>
        <api.Label text='create account' />
      </api.Button>

      <api.Label $text={$error} textColor={0x99000099} />

    </api.GroupY>
  </api.Center>
}

function VerifyView({ state }: { state: VerifyingState }) {
  const $error = api.$('')

  const tokenField = makeTextField({
    border: { padding: 2 },
    textbox: { onEnter: verify, autofocus: true },
  })

  async function verify() {
    const token = tokenField.textbox.text
    if (!token.trim()) return

    const [ok, err] = await POST('/user/verify', token)
    if (!ok) {
      $error.val = err
      return
    }

    $state.val = { ...state, type: 'known' }
    // userinfo.set({ key: 'username', val: 'theadmin3' })
  }

  return <api.Center>
    <api.GroupY gap={4}>

      <api.GroupX>

        <api.GroupY gap={2}>
          <api.Border padding={2}><api.Label textColor={0xffffff33} text='token' /></api.Border>
        </api.GroupY>

        <api.GroupY gap={2}>
          {tokenField.scroll}
        </api.GroupY>

      </api.GroupX>

      <api.Button padding={2} onClick={verify}>
        <api.Label text='verify' />
      </api.Button>

      <api.Label $text={$error} textColor={0x99000099} />

    </api.GroupY>
  </api.Center>
}

function WelcomeView({ state }: { state: KnownState }) {
  return <api.Center>
    <api.Label text={`Welcome, ${state.username}`} />
  </api.Center>
}

const panel = await api.Panel.create({ name: 'account' },
  <api.PanelView title={api.$('account')} size={api.$({ w: 150, h: 120 })}>
    <api.Margin $children={$state.adapt(state => {
      if (state.type === 'verifying') return [<VerifyView state={state} />]
      if (state.type === 'known') return [<WelcomeView state={state} />]
      return [<SigninView />]
    })} />
  </api.PanelView>
)

panel.focusPanel()
