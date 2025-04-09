import * as api from '/api.js'



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
    textbox: { onEnter: create, onTab: create, autofocus: true },
    border: { padding: 2 },
  })

  const emailField = makeTextField({
    textbox: { onEnter: create, onTab: create },
    border: { padding: 2 },
  })

  async function create() {
    const username = userField.textbox.text
    if (!username) { userField.textbox.focus(); return }

    const email = emailField.textbox.text
    if (!email) { emailField.textbox.focus(); return }

    const [err] = await api.POST('/user/new', `${username} ${email}`)
    if (err) { $error.val = err; return }

    api.$userState.val = { type: 'verifying', username, email, publishes: false }
  }

  return <api.Center>
    <api.GroupY gap={4}>

      <api.GroupX>

        <api.GroupY gap={2}>
          <api.Border padding={2}><api.Label color={0xffffff33} text='username' /></api.Border>
          <api.Border padding={2}><api.Label color={0xffffff33} text='email' /></api.Border>
        </api.GroupY>

        <api.GroupY gap={2}>
          {userField.scroll}
          {emailField.scroll}
        </api.GroupY>

      </api.GroupX>

      <api.Button padding={2} onClick={create}>
        <api.Label text='create account' />
      </api.Button>

      <api.Label $text={$error} color={0x99000099} />

    </api.GroupY>
  </api.Center>
}

function VerifyView({ state }: { state: api.VerifyingState }) {
  const $error = api.$('')

  const tokenField = makeTextField({
    border: { padding: 2 },
    textbox: { onEnter: verify, onTab: verify, autofocus: true },
  })

  async function verify() {
    const token = tokenField.textbox.text
    if (!token.trim()) return

    const [err] = await api.POST('/user/verify', token)
    if (err) { $error.val = err; return }

    api.$userState.val = {
      type: 'known',
      username: state.username,
      email: state.email,
      publishes: false,
    }
  }

  return <api.Center>
    <api.GroupY gap={4}>

      <api.GroupX>

        <api.GroupY gap={2}>
          <api.Border padding={2}><api.Label color={0xffffff33} text='token' /></api.Border>
        </api.GroupY>

        <api.GroupY gap={2}>
          {tokenField.scroll}
        </api.GroupY>

      </api.GroupX>

      <api.Button padding={2} onClick={verify}>
        <api.Label text='verify' />
      </api.Button>

      <api.Label $text={$error} color={0x99000099} />

    </api.GroupY>
  </api.Center>
}

function WelcomeView({ state }: { state: api.KnownState }) {
  async function enablePublishing() {
    const [err] = await api.POST('/user/publish', '')
    if (err) { console.error(err); return }
    api.$userState.val = { ...state, publishes: true }
  }

  async function logout() {
    const [err] = await api.POST('/user/logout', '')
    if (err) { console.error(err); return }
    api.updateAccountFromServer()
  }

  return (
    <api.PanedYA>

      <api.GroupX background={0x00000033}>
        {state.publishes
          ? <api.View />
          : <api.Button onClick={enablePublishing} padding={2}>
            <api.Label text='enable publishing' />
          </api.Button>
        }
        <api.Button onClick={logout} padding={2}>
          <api.Label text='logout' />
        </api.Button>
      </api.GroupX>

      <api.Center>
        <api.Label text={`Welcome, ${state.username}`} />
      </api.Center>

    </api.PanedYA>
  )
}

const panel = await api.Panel.create({ name: 'account' },
  <api.PanelView title={api.$('account')} size={api.$({ w: 150, h: 120 })}>
    <api.Margin $children={api.$userState.adapt(state => {
      if (state.type === 'verifying') return [<VerifyView state={state} />]
      if (state.type === 'known') return [<WelcomeView state={state} />]
      return [<SigninView />]
    })} />
  </api.PanelView>
)

panel.focusPanel()
