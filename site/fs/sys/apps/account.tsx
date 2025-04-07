import * as api from '/api.js'


// const mylocalstorage = await api.opendb<{ key: string, val: any }>('mylocalstorage', 'key')



// const user = await mylocalstorage.get('username')

// if (!user) {

//   console.log(await fetch(api.config.net + '/newuser', {
//     method: 'post',
//     body: 'theadmin3 admin@90s.dev yes',
//     credentials: 'include',
//   }).then(r => {
//     console.log(r.status)

//     if (r.status === 200) {
//       mylocalstorage.set({ key: 'username', val: 'theadmin' })
//     }

//     return r.text()
//   }))
// }
// else {

//   console.log(await fetch(api.config.net + '/fs/', {
//     credentials: 'include',
//   }).then(r => {
//     console.log(r.status)
//     return r.text()
//   }))

// }


const panel = await api.Panel.create({ name: 'filer' },
  <api.PanelView title={api.$('filer')} size={api.$({ w: 150, h: 120 })}>
    <api.Center>
      <api.Button padding={2}>
        <api.Label text='create account' />
      </api.Button>
    </api.Center>
  </api.PanelView>
)

panel.focusPanel()
