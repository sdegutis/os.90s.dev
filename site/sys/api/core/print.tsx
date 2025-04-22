import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { Scroll } from "../views/scroll.js"
import { View } from "../views/view.js"
import { $ } from "./ref.js"
import { sys } from "./sys.js"

let next = Promise.resolve()

export async function print(...args: any[]) {
  next = next.then(prepare).then(() => {
    lazy.addLine(args.join(' '))
  })
}

let lazy: { addLine: (text: string) => void }

async function prepare() {
  if (lazy) return

  const $lines = $<View[]>([])

  const panel = await sys.makePanel({ name: 'fake console' },
    <Scroll size={sys.$size} background={0x111111ff}>
      <GroupY children={$lines} gap={2} />
    </Scroll>
  )

  function addLine(text: string) {
    console.log('a', $lines.val)
    $lines.val = [...$lines.val, <Label text={text} />]
    console.log('ab', $lines.val)
  }

  lazy = { addLine }
}
