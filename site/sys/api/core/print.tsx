import { Border } from "../views/border.js"
import { GroupYA } from "../views/group.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { View } from "../views/view.js"
import { $ } from "./ref.js"
import { sys } from "./sys.js"

let next = Promise.resolve()
const ensure = ensured(make)

export function print(...args: any[]) {
  next = next.then(ensure).then(con => {
    con.addLine(args.join(' '))
  })
}

function ensured<T>(fn: () => T) {
  let lazy: T
  return () => lazy ??= fn()
}

async function make() {
  const $lines = $<View[]>([])

  const scroll = <Scroll size={sys.$size} background={0x111111ff}>
    <Border padding={2}>
      <GroupYA children={$lines} gap={2} />
    </Border>
  </Scroll> as Scroll

  await sys.makePanel({ name: 'fake console' }, scroll)

  return {
    addLine: (text: string) => {
      const label = <Label text={text} />
      $lines.val = [...$lines.val, label]
      scroll.scrollVisible(label)
    },
  }
}
