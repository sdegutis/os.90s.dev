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
