import * as api from '/api.js'


const userinfo = await api.opendb<{ key: string, val: any }>('userinfo', 'key')


// const user = await userinfo.get('username')
// if (!user) {

console.log(await fetch(api.config.net + '/newuser', {
  method: 'post',
  body: 'theadmin3 admin@90s.dev',
  credentials: 'include',
}).then(r => {
  console.log(...r.headers)
  console.log(r.status)

  if (r.status === 200) {
    userinfo.set({ key: 'username', val: 'theadmin3' })
  }

  return r.text()
}))

// }
// else {

//   console.log(await fetch(api.config.net + '/fs/', {

//   }).then(r => {



//     console.log(...r.headers)
//     console.log(r.status)
//     return r.text()
//   }))

// }

async function create() {

}

const panel = await api.Panel.create({ name: 'account' },
  <api.PanelView title={api.$('account')} size={api.$({ w: 150, h: 120 })}>
    <api.Center>
      <api.Button padding={2} onClick={create}>
        <api.Label text='create account' />
      </api.Button>
    </api.Center>
  </api.PanelView>
)

panel.focusPanel()
