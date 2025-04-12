import * as api from '/api.js'



function makeTextField(data: {
  textbox?: api.JsxAttrs<api.TextBox>,
  border?: api.JsxAttrs<api.Border>,
  scroll?: api.JsxAttrs<api.Scroll>,
  length?: number,
}) {

  const length = data.length ?? 50

  const textbox = <api.TextBox {...data.textbox} /> as api.TextBox

  const border = <api.Border
    padding={2}
    children={[textbox]}
    {...data.border} /> as api.Border

  const scroll = <api.Scroll
    showh={false}
    showv={false}
    background={0x00000033}
    onMouseDown={function (...args) { textbox.onMouseDown(...args) }}
    onMouseMove={function (...args) { textbox.onMouseMove?.(...args) }}
    size={border.$size.adapt(s => ({ w: length, h: border.$size.val.h }))}
    children={[border]}
    {...data.scroll} />

  return { scroll, border, textbox }

}


function SimpleForm(data: {
  label: string,
  buttons: Record<string, (value: string) => Promise<string | void>>,
}) {
  const $error = api.$('')

  function wrapSubmit(onSubmit: (val: string) => Promise<string | void>) {
    return async () => {
      const error = await onSubmit(field.textbox.model.getText())
      if (error) $error.val = error
    }
  }

  const defaultButton = Object.values(data.buttons).at(-1)!

  const field = makeTextField({
    textbox: { onEnter: wrapSubmit(defaultButton), autofocus: true },
    border: { padding: 2 },
  })

  return (
    <api.Center>
      <api.GroupY gap={4}>

        <api.GroupX>
          <api.Border padding={2}>
            <api.Label color={0xffffff33} text={data.label} />
          </api.Border>
          {field.scroll}
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


function SigninView() {
  return <SimpleForm
    buttons={{
      'sign in|up': async (username) => {
        const [err, known] = await api.POST('/user/sign', username)
        if (err) { return err }
        const next = known ? 'verifying' : 'registering'
        api.$userState.val = { type: next, username }
      },
    }}
    label='username'
  />
}

function RegisterView({ state }: { state: api.UserStateRegistering }) {
  return <SimpleForm
    buttons={{
      'go back': async () => {
        api.$userState.val = { type: 'guest' }
      },
      'register': async (email) => {
        const [err] = await api.POST('/user/register', `${state.username} ${email}`)
        if (err) { return err }
        api.$userState.val = { type: 'verifying', username: state.username }
      }
    }}
    label='email'
  />
}

function VerifyView({ state }: { state: api.UserStateVerifying }) {
  return <SimpleForm
    buttons={{
      'go back': async () => {
        console.log(api.$userState.val)
        api.$userState.val = { type: 'guest' }
      },
      'verify': async (token) => {
        const [err] = await api.POST('/user/verify', token)
        if (err) { return err }
        api.$userState.val = {
          type: 'known',
          username: state.username,
        }
      }
    }}
    label='token'
  />
}

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
        <api.Label text={`Welcome, ${state.username}`} />
      </api.Center>

    </api.PanedYA>
  )

}

const panel = await api.sys.makePanel({ name: 'account' },
  <api.PanelView title='account' size={{ w: 150, h: 120 }}>
    <api.Margin children={api.$userState.adapt(state => {
      switch (state.type) {
        case 'guest': return [<SigninView />]
        case 'registering': return [<RegisterView state={state} />]
        case 'verifying': return [<VerifyView state={state} />]
        case 'known': return [<WelcomeView state={state} />]
      }
    })} />
  </api.PanelView>
)

panel.focusPanel()
