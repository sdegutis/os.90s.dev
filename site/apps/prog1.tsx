import { progRPC } from "../shared/rpc.js"


const rpc = progRPC(self)

rpc.send('init', [])
const [id] = await rpc.once('init')

console.log('got ', id)

if (id === 1) {

  rpc.send('newpanel', [])
  const [id, x, y, w, h] = await rpc.once('newpanel')
  console.log(id, x, y, w, h)

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
