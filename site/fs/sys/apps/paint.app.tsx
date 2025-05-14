import api, { $, Border, Button, GroupX, GroupY, Label, PanedXB, Ref, Scroll, View, type Size } from '/os/api.js'
import '/os/fs/sys/libs/colorpicker.js'
import { drawPinStripes } from '/os/fs/sys/libs/draw.js'
await api.preludesFinished

const $color = $(0x00000000)

const file = {
  $path: $(api.program.opts["file"] ?? 'usr/untitled1.bmp.jsln'),
  getContents() {
    return ''
  }
}

const panel = await api.sys.makePanel({ name: "paint" },
  <panel size={{ w: 220, h: 150 }} file={file}>
    <PanedXB>
      <Scroll draw={drawPinStripes()}>
        <View />
      </Scroll>
      <GroupY background={0x333333ff}>
        <Border padding={2}>
          <GroupY gap={2}>
            <colorpicker $color={$color} />
            <SizeLabels $size={$<Size>({ w: 8, h: 8 })} />
            <Button paddingAll={[2, 4]}>
              <Label text='grid' />
            </Button>
          </GroupY>
        </Border>
      </GroupY>
    </PanedXB>
  </panel>
)

panel.focusPanel()

function SizeLabels(data: { $size: Ref<Size> }) {
  return <GroupX gap={2}>
    <Label text={data.$size.adapt(s => s.w.toString())} />
    <Label text='*' color={0xffffff33} />
    <Label text={data.$size.adapt(s => s.h.toString())} />
  </GroupX>
}
