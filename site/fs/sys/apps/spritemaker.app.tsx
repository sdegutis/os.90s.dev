import api, { $, Border, GroupX, GroupY, Label, Ref, type Size } from '/os/api.js'
await api.preludesFinished

const $color = $(0x00000000)

const file = {
  $path: $(api.program.opts["file"] ?? 'usr/mysprite.jsln'),
  getContents() {
    return ''
  }
}

const panel = await api.sys.makePanel({ name: "sprite maker" },
  <panel size={{ w: 220, h: 150 }} file={file}>
    <api.Center>
      <Border background={0xffffff11} padding={2} up={3}>
        <GroupY>
          <colorpicker $color={$color} />
          <SizeLabels $size={$<Size>({ w: 8, h: 8 })} />
        </GroupY>
      </Border>
    </api.Center>
  </panel>
)

panel.focusPanel()

function SizeLabels(data: { $size: Ref<Size> }) {
  return <GroupX gap={2}>
    <GroupX gap={-1}>
      <Label text='w:' color={0xffffff33} />
      <Label text={data.$size.adapt(s => s.w.toString())} />
    </GroupX>
    <GroupX gap={-1}>
      <Label text='h:' color={0xffffff33} />
      <Label text={data.$size.adapt(s => s.h.toString())} />
    </GroupX>
  </GroupX>
}
