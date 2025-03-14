import { progRPC } from "../shared/rpc.js"
import { Listener } from "../util/listener.js"

console.log('hey')

const pid = Promise.withResolvers()

// let panelp: PromiseWithResolvers<[number, number, number, number, number]>

let panelp = new Listener<[number, number, number, number, number]>()

const rpc = progRPC(self, {

  init(id) {
    pid.resolve(id)
  },

  panel(id, x, y, w, h) {
    panelp.dispatch([id, x, y, w, h])
    // panelp?.resolve([id, x, y, w, h])
  },

})

const id = await pid.promise

console.log('got ', id)

if (id === 1) {

  // panelp = Promise.withResolvers()

  rpc('newpanel', [])

  const p = Promise.withResolvers<[number, number, number, number, number]>()
  const done = panelp.watch(res => {
    done()
    p.resolve(res)
  })
  const res = await p.promise

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
