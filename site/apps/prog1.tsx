import { Listener } from "../shared/listener.js"
import { progRPC } from "../shared/rpc.js"

console.log('hey')

// let panelp: PromiseWithResolvers<[number, number, number, number, number]>

let panelp = new Listener<[number, number, number, number, number]>()

const rpc = progRPC(self)


const [id] = await rpc.wait('init')

console.log('got ', id)

if (id === 1) {

  // panelp = Promise.withResolvers()

  // panel(id, x, y, w, h) {
  //   panelp.dispatch([id, x, y, w, h])
  //   // panelp?.resolve([id, x, y, w, h])
  // },


  rpc.send('newpanel', [])

  const res = await rpc.wait('panel')
  console.log(res)



}




// panel.frame.children = [
//   $$(<view background={0x009900ff}
//     x={10}
//     y={10}
//     w={10}
//     h={10}
//   ></view>).view
// ]

// panel.frame.background = 0x99000099

// panel.frame.draw()
// panel.blit()
