import { $, Ref } from "./events.js"
import { $$ } from "./jsx.js"
import { Panel } from "./panel.js"

const panel = new Panel()
await panel.ready

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
