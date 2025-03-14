import { progRPC } from "../shared/rpc.js"

console.log('hey')

const pid = Promise.withResolvers()

const rpc = progRPC(self, {

  init(id) {
    pid.resolve(id)
  },

  panel(id, x, y, w, h) {

  },

})

const id = await pid.promise

console.log('got ', id)

if (id === 1) {

  rpc('newpanel', [])



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
