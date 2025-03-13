import { $, Ref } from "./events.js"
import { $$ } from "./jsx.js"
import { Panel } from "./panel.js"

const panel = new Panel()
await panel.ready

function TestView(data: { text: Ref<string> }) {
  return <label text={data.text} />
}

let mytext = $('hello')

const tree = $$(
  <TestView text={mytext} />
)

console.log(tree.view)
