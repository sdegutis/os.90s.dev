import { $$ } from "../util/jsx.js"
import { $, type Ref } from "../util/ref.js"
import type { Label } from "../views/label.js"
import { panel } from "./panel.js"

panel

function TestView(data: { text: Ref<string> }) {
  return <label text={data.text} x={1}

  />
}

let mytext = $('hello')

const tree = $$(
  <TestView text={mytext} />
)

console.log((tree.view as Label).text)

setTimeout(() => {
  mytext.val += ' world'
  setTimeout(() => console.log((tree.view as Label).text))
})



function SpriteImageChooser() {
  return <></>
}

function SpriteChooser() {
  return <></>
}

function ColorChooser(data: { color: Ref<number> }) {
  return <></>
}

function SpriteCanvas(data: { color: Ref<number> }) {
  return <></>
}

function SpriteEditor() {
  const color = $(0xffffffff)
  return (
    <panedya>
      <panedxb background={0xffffff22}>
        <SpriteCanvas color={color} />
        <ColorChooser color={color} />
      </panedxb>
      <splity pos={30}>
        <SpriteImageChooser />
        <SpriteChooser />
      </splity>
    </panedya>
  )
}
