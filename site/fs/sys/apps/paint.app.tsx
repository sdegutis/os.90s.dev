import api, { $, Border, Button, dragResize, GroupX, GroupY, Label, multiplex, PanedXB, Ref, sys, View, type Size } from '/os/api.js'
import { drawPinStripes } from '/os/fs/sys/libs/draw.js'
await api.preludesFinished

const $color = $(0x00000000)
const $grid = $(true)

const $size = $<Size>({ w: 12, h: 12 })
const $zoom = $(6)

$zoom.intercept(z => Math.max(1, z))

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
        <CanvasView color={$color} grid={$grid} realSize={$size} zoom={$zoom} canvasSize={$canvasSize} />
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
            <Zoomer zoom={$zoom} />
          </GroupY>
        </Border>
      </GroupY>
    </PanedXB>
  </panel>
)

panel.focusPanel()

function Zoomer(data: { zoom: Ref<number> }) {
  const DRAGFACTOR = -5

  return <GroupX canMouse onMouseDown={clickZoom}>
    <Label text='zoom:' color={0xffffff33} />
    <Label text={data.zoom.adapt(z => z.toString())} />
  </GroupX>

  function clickZoom(this: View) {
    const $size = $({ w: 0, h: data.zoom.val * DRAGFACTOR })
    const done = dragResize(sys.$mouse, $size)
    this.onMouseUp = done

    $size.watch(size => {
      data.zoom.value = Math.round(size.h / DRAGFACTOR)
    })
  }
}

function SizeLabels(data: { $size: Ref<Size> }) {
  return <GroupX gap={2}>
    <Label text={data.$size.adapt(s => s.w.toString())} />
    <Label text='*' color={0xffffff33} />
    <Label text={data.$size.adapt(s => s.h.toString())} />
  </GroupX>
}

function CanvasView(data: {
  color: Ref<number>,
  zoom: Ref<number>,
  canvasSize: Ref<Size>,
  realSize: Ref<Size>,
  grid: Ref<boolean>,
}) {
  let showMouse = false

  const view = <View
    size={data.canvasSize}
    onMouseEnter={() => {
      sys.pushCursor('')
    }}
    onMouseExit={() => {
      showMouse = false
      sys.popCursor('')
    }}
    canMouse
    onMouseDown={function () {
      const done = $currentPoint.watch(p => {
        console.log(p)
      })

      this.onMouseUp = done
    }}
    onMouseMove={function () {
      showMouse = true
      this.needsRedraw()
    }}
    draw={function (ctx) {
      this.drawBackground(ctx, 0x00000033)

      if (data.grid.val && data.zoom.val > 2) {
        const z = data.zoom.val
        for (let y = 0; y < data.realSize.val.h * z; y += z) {
          ctx.fillRect(0, y, this.size.w, 1, 0xffffff11)
        }
        for (let x = 0; x < data.realSize.val.w * z; x += z) {
          ctx.fillRect(x, 0, 1, this.size.h, 0xffffff11)
        }
      }

      if (showMouse) {
        const z = data.zoom.val
        const x = Math.floor(this.mouse.x / z)
        const y = Math.floor(this.mouse.y / z)
        ctx.fillRect(x * z, y * z, z, z, data.color.val)
      }
    }}
  />

  const $currentPoint = multiplex([view.$mouse, data.zoom], (mouse, z) => {
    const x = Math.floor(mouse.x / z)
    const y = Math.floor(mouse.y / z)
    return { x, y }
  })

  return view
}

function Resizer(data: { canvasSize: Ref<Size>, realSize: Ref<Size>, zoom: Ref<number> }) {
  return <View
    background={0x000000aa}
    point={data.canvasSize.adapt(size => ({ x: size.w, y: size.h }))}
    size={{ w: 4, h: 4 }}
    canMouse
    onMouseDown={function () {
      const $size = $<Size>({ w: $canvasSize.val.w, h: $canvasSize.val.h })
      $size.watch(size => {
        data.realSize.value = {
          w: Math.max(1, Math.round(size.w / data.zoom.val)),
          h: Math.max(1, Math.round(size.h / data.zoom.val)),
        }
      })
      const done = dragResize(sys.$mouse, $size)
      this.onMouseUp = done
    }}
  />
}
