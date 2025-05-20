import api, { $, Border, Button, GroupX, GroupY, Label, multiplex, PanedXB, Ref, Scroll, View, type Size } from '/os/api.js'
import { drawPinStripes } from '/os/fs/sys/libs/draw.js'
await api.preludesFinished

const $color = $(0x00000000)
const $grid = $(true)

const $size = $<Size>({ w: 24, h: 24 })
const $zoom = $(2)

const $canvasSize = multiplex([$size, $zoom], (size, zoom) => {
  return { w: size.w * zoom, h: size.h * zoom }
})

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
        <View size={$canvasSize} background={0x00000033} />
      </Scroll>
      <GroupY background={0x333333ff}>
        <Border padding={2}>
          <GroupY gap={2}>
            <colorpicker $color={$color} />
            <SizeLabels $size={$<Size>({ w: 8, h: 8 })} />
            <Button paddingAll={[2, 4]} selected={$grid} onClick={() => $grid.value = !$grid.value}>
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
