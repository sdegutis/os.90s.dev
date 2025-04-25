import api from '/api.js'
await api.appReady

const panel = await api.sys.makePanel({ name: 'account' },
  <panel size={{ w: 150, h: 120 }}>
    <api.Margin children={api.$userState.adapt(state => {
      switch (state.type) {
        case 'registering': return [<RegisterView state={state} />]
        case 'verifying': return [<VerifyView state={state} />]
        case 'known': return [<WelcomeView state={state} />]
        case 'guest':
        default: return [<SigninView />]
      }
    })} />
  </panel>
)

panel.focusPanel()

function WelcomeView({ state }: { state: api.UserStateKnown }) {
  async function logout() {
    const [err] = await api.POST('/user/logout', '')
    if (err) { console.error(err); return }
    api.updateAccountFromServer()
  }

  return (
    <api.PanedYA>

      <api.GroupX background={0x00000033}>
        <api.Button onClick={logout} padding={2}>
          <api.Label text='logout' />
        </api.Button>
      </api.GroupX>

      <api.Center>
        <api.Label text={`Welcome, ${state.username}!`} />
      </api.Center>

    </api.PanedYA>
  )
}

function SigninView() {
  return <SimpleForm
    buttons={{
      'sign in|up': async (username) => {
        const [err, known] = await api.POST('/user/sign', username)
        if (err) { return err }
        const next = known ? 'verifying' : 'registering'
        api.$userState.$ = { type: next, username }
      },
    }}
    label='username'
  />
}

function RegisterView({ state }: { state: api.UserStateRegistering }) {
  return <SimpleForm
    buttons={{
      'go back': async () => {
        api.$userState.$ = { type: 'guest' }
      },
      'register': async (email) => {
        const [err] = await api.POST('/user/register', `${state.username} ${email}`)
        if (err) { return err }
        api.$userState.$ = { type: 'verifying', username: state.username }
      }
    }}
    label='email'
  />
}

function VerifyView({ state }: { state: api.UserStateVerifying }) {
  return <SimpleForm
    buttons={{
      'go back': async () => {
        console.log(api.$userState.$)
        api.$userState.$ = { type: 'guest' }
      },
      'verify': async (token) => {
        const [err] = await api.POST('/user/verify', token)
        if (err) { return err }
        api.$userState.$ = {
          type: 'known',
          username: state.username,
        }
      }
    }}
    label='token'
  />
}

function SimpleForm(data: {
  label: string,
  buttons: Record<string, (value: string) => Promise<string | void>>,
}) {
  const $error = api.$('')
  const model = new api.TextModel()

  function wrapSubmit(onSubmit: (val: string) => Promise<string | void>) {
    return async () => {
      const error = await onSubmit(model.getText())
      if (error) $error.$ = error
    }
  }

  const lastOnSubmit = Object.values(data.buttons).at(-1)!

  return (
    <api.Center>
      <api.GroupY gap={4}>

        <api.GroupX>
          <api.Border padding={2}>
            <api.Label color={0xffffff33} text={data.label} />
          </api.Border>
          <textfield model={model} onEnter={wrapSubmit(lastOnSubmit)} autofocus />
        </api.GroupX>

        <api.GroupX
          gap={2}
          children={Object.entries(data.buttons).map(([label, onSubmit]) => {
            return <api.Button padding={2} onClick={wrapSubmit(onSubmit)} background={0xffffff11}>
              <api.Label text={label} />
            </api.Button>
          })}
        />

        <api.Label text={$error} color={0x99000099} />

      </api.GroupY>
    </api.Center>
  )
}
