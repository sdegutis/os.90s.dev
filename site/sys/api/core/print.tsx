import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { View } from "../views/view.js"
import { $ } from "./ref.js"
import { sys } from "./sys.js"

let next = Promise.resolve()

export function print(...args: any[]) {
  next = next.then(ensure).then(con => {
    con.addLine(args.join(' '))
  })
}

ensure.lazy = undefined as Awaited<ReturnType<typeof make>> | undefined
async function ensure() {
  return ensure.lazy ??= await make()
}

async function make() {
  const $lines = $<View[]>([])

  const scroll = <Scroll size={sys.$size} background={0x111111ff}>
    <GroupY children={$lines} gap={2} />
  </Scroll> as Scroll

  await sys.makePanel({ name: 'fake console' }, scroll)

  return {
    addLine: (text: string) => {
      $lines.val = [...$lines.val, <Label text={text} />]
    },
  }
}
