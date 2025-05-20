import api, { $, Border, Button, dragResize, GroupX, GroupY, Label, multiplex, PanedXB, Ref, sys, View, type Size } from '/os/api.js'
import { drawPinStripes } from '/os/fs/sys/libs/draw.js'
await api.preludesFinished

const $color = $(0x00000000)
const $grid = $(true)

const $size = $<Size>({ w: 24, h: 24 })
const $zoom = $(2)

const $canvasSize = multiplex([$size, $zoom], (size, zoom) => ({
  w: size.w * zoom,
  h: size.h * zoom,
}))

const file = {
  $path: $(api.program.opts["file"] ?? 'usr/untitled1.bmp.jsln'),
  getContents() {
    return ''
  }
}

const panel = await api.sys.makePanel({ name: "paint" },
  <panel size={{ w: 220, h: 150 }} file={file}>
    <PanedXB>
      <View draw={drawPinStripes()}>
        <CanvasView grid={$grid} canvasSize={$canvasSize} />
        <Resizer canvasSize={$canvasSize} realSize={$size} zoom={$zoom} />
      </View>
      <GroupY background={0x333333ff}>
        <Border padding={2}>
          <GroupY gap={2}>
            <colorpicker $color={$color} />
            <SizeLabels $size={$size} />
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

function CanvasView(data: { canvasSize: Ref<Size>, grid: Ref<boolean> }) {
  return <View size={data.canvasSize} background={0x00000033} />
}

function Resizer(data: { canvasSize: Ref<Size>, realSize: Ref<Size>, zoom: Ref<number> }) {
  const point = data.canvasSize.adapt(size => ({ x: size.w, y: size.h }))
  const view = <View canMouse point={point} background={0x000000aa} size={{ w: 4, h: 4 }} />
  view.onMouseDown = () => {
    const $size = $<Size>({ w: $canvasSize.val.w, h: $canvasSize.val.h })
    $size.watch(size => {
      data.realSize.value = {
        w: Math.round(size.w / data.zoom.val),
        h: Math.round(size.h / data.zoom.val),
      }
    })
    const done = dragResize(sys.$mouse, $size)
    view.onMouseUp = done
  }
  return view
}
