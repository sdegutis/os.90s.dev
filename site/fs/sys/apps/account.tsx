import * as api from '/api.js'


const userinfo = await api.opendb<{ key: string, val: any }>('userinfo', 'key')


// const user = await userinfo.get('username')
// if (!user) {

async function POST(path: string, data: any) {
  return fetch(api.config.net + path, {
    method: 'post',
    body: JSON.stringify(data),
    credentials: 'include',
  }).then(r => r.json())
}





async function create() {
  const username = usernameTextarea.text
  const email = emailTextarea.text

  console.log([username, email])

  return

  const [ok, err] = await POST('/newuser', { name: 'theadmin3', email: 'admin@90s.dev' })
  if (!ok) {
    console.log(err)
    return
  }

  userinfo.set({ key: 'username', val: 'theadmin3' })
}

const usernameTextarea: api.TextField = <api.TextField autofocus />
const emailTextarea: api.TextField = <api.TextField />


const panel = await api.Panel.create({ name: 'account' },
  <api.PanelView title={api.$('account')} size={api.$({ w: 150, h: 120 })}>
    <api.Center>
      <api.GroupY gap={4} align='a'>
        <api.GroupX gap={2}>
          <api.Label text='username' />
          {usernameTextarea}
        </api.GroupX>
        <api.GroupX gap={2}>
          <api.Label text='email' />
          {emailTextarea}
        </api.GroupX>
        <api.Button padding={2} onClick={create}>
          <api.Label text='create account' />
        </api.Button>
      </api.GroupY>
    </api.Center>
  </api.PanelView>
)

panel.focusPanel()
