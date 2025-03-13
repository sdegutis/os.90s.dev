import { $, Ref } from "./events.js"
import { $$ } from "./jsx.js"
import { ontick } from "./ontick.js"
import { Panel } from "./panel.js"
import { PixelCanvas } from "./pixel.js"

const panel = new Panel()
await panel.ready

const pix = new PixelCanvas(panel.content)

// for (let y = 0; y < h; y++) {
//   for (let x = 0; x < w; x++) {
//     const i = y * w * 4 + x * 4
//     pixels[i + 3] = 128
//   }
// }

pix.pixels.fill(Math.random() * 255)

pix.blit()

panel.blit()


ontick((d) => {
  // // for (let n = 0; n < 10; n++)
  // for (let y = 0; y < h; y++) {
  //   for (let x = 0; x < w; x++) {
  //     let i = y * w * 4 + x * 4
  //     pixels[i + 0] = Math.random() * 255
  //     pixels[i + 1] = Math.random() * 255
  //     pixels[i + 2] = Math.random() * 255
  //     // pixels[i + 3] = 255
  //   }
  // }

  // ctx.putImageData(imgdata, 0, 0)
  // panel.blit()
})()

// console.log(
//   <view x={2} >
//     <view />
//     <view />
//   </view>
// )



class SpriteImage {
}

class Sprite {
  w = 8
  h = 8
  images: SpriteImage[] = []
  current = 0
}

class SpriteSheet {
  sprites: Sprite[] = []
  current = 0
}

function ColorSelector(data: { palette: string, index: number }) {
  return <view y={data.index}></view>
}

function ViewForSheet(data: { sheet: Ref<SpriteSheet> }) {
  const number = 11
  const palette = 'hi'
  return <view x={$(2)}>
    <border padding={3}>
      <label text={'he'} />
    </border>
    <ColorSelector index={number} palette={palette} />
  </view>
}

const tree = $$(
  <ViewForSheet sheet={$(new SpriteSheet())} />
)

console.log(tree.view)
