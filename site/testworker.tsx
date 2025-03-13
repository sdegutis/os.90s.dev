import type { Label } from "./controls/label.js"
import { $, Ref } from "./events.js"
import { $$ } from "./jsx.js"
import { Panel } from "./panel.js"

const panel = new Panel()
await panel.ready

function TestView(data: { text: Ref<string> }) {
  return <label text={data.text} x={1} />
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
