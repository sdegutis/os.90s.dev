import api, { $, as, Border, Button, dragResize, GroupX, GroupY, JSLN, Label, multiplex, PanedXB, Ref, Scroll, sys, View, type Size } from '/os/api.js'
import { drawPinStripes } from '/os/fs/sys/libs/draw.js'
await api.preludesFinished

const $color = $(0x00000000)
const $grid = $(true)

const $size = $<Size>({ w: 12, h: 12 })
const $zoom = $(6)

const spots: Record<string, number | undefined> = Object.create(null)

$zoom.intercept(z => Math.max(1, z))

const $canvasSize = multiplex([$size, $zoom], (size, zoom) => ({
  w: size.w * zoom,
  h: size.h * zoom,
}))

// We could just use all these as globals
// instead of passing as data args to JSX
// but this makes it easier to refactor.

const filepath = api.program.opts["file"]
await tryLoadingFile(filepath, spots, $size)


const panel = await api.sys.makePanel({ name: "paint" },
  <panel
    size={{ w: 220, h: 150 }}
    file={{
      $path: $(filepath),
      getContents: () => serializeFile($size, spots),
    }}
    onKeyPress={(key) => {
      if (key === 'ctrl z') { undo(); return true }
      if (key === 'ctrl Z') { redo(); return true }
      if (key === 'ctrl y') { redo(); return true }
      return false
    }}
  >
    <PanedXB>
      <Scroll draw={drawPinStripes()}>
        <View size={$canvasSize.adapt(size => ({ w: size.w + 10, h: size.h + 10 }))}>
          <CanvasView color={$color} grid={$grid} realSize={$size} zoom={$zoom} canvasSize={$canvasSize} />
          <Resizer canvasSize={$canvasSize} realSize={$size} zoom={$zoom} />
        </View>
      </Scroll>
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
panel.root.focus()

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
    onMouseDown={function (button) {
      const done = $currentPoint.watch(p => {
        const key = `${p.x},${p.y}`
        spots[key] = button === 0 ? data.color.val : undefined
      })

      this.onMouseUp = done
    }}
    onMouseMove={function () {
      showMouse = true
      this.needsRedraw()
    }}
    draw={function (ctx) {
      this.drawBackground(ctx, 0x00000033)

      const z = data.zoom.val
      const size = data.realSize.val

      if (data.grid.val && data.zoom.val > 2) {
        for (let y = 0; y < size.h * z; y += z) {
          ctx.fillRect(0, y, this.size.w, 1, 0xffffff11)
        }
        for (let x = 0; x < data.realSize.val.w * z; x += z) {
          ctx.fillRect(x, 0, 1, this.size.h, 0xffffff11)
        }
      }

      for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
          const col = spots[`${x},${y}`]
          if (col === undefined) continue
          ctx.fillRect(x * z, y * z, z, z, col)
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
      const initialSize: Size = { w: $canvasSize.val.w, h: $canvasSize.val.h }
      const $literalSize = $(initialSize)

      const $resizedTo = $literalSize.adapt(size => ({
        w: Math.max(1, Math.round(size.w / data.zoom.val)),
        h: Math.max(1, Math.round(size.h / data.zoom.val)),
      }))

      $resizedTo.watch(size => data.realSize.value = size)

      const unlisten = dragResize(sys.$mouse, $literalSize)
      this.onMouseUp = () => {
        undoStack.push(() => data.realSize.set(initialSize))
        redoStack.push(() => data.realSize.set($resizedTo.val))
        unlisten()
      }
    }}
  />
}

function serializeFile($size: Ref<Size>, spots: Record<string, number | undefined>) {
  const colors: number[] = []
  const pixels: number[] = []
  const size = $size.val

  function colorIndex(col: number) {
    const idx = colors.indexOf(col)
    if (idx !== -1) return idx + 1
    return colors.push(col)
  }

  for (let y = 0; y < size.h; y++) {
    for (let x = 0; x < size.w; x++) {
      const key = `${x},${y}`
      const col = spots[key]
      const idx = col === undefined ? 0 : colorIndex(col)
      pixels.push(idx)
    }
  }

  let pixelsString = ''
  for (let i = 0; i < pixels.length; i++) {
    const sep = (i % size.w) === (size.w - 1) ? '\n' : ' '
    pixelsString += pixels[i].toString(16) + sep
  }
  pixelsString = pixelsString.trim()

  const dataFile = JSLN.stringify({ colors, pixels: pixelsString })
  console.log(dataFile)

  return dataFile
}

async function tryLoadingFile(filepath: string, spots: Record<string, number | undefined>, $size: Ref<Size>) {
  if (!filepath) return

  const content = await api.fs.getFile(filepath)
  if (!content) return

  const jsln = JSLN.parse(content)

  const colors = as(jsln, 'colors', as.numbers())
  const pixelStr = as(jsln, 'pixels', as.string)
  if (!colors || !pixelStr) return

  const width = pixelStr.match(/([0-9a-f]+|\n)/g)!.indexOf('\n')

  let x = 0, y = 0
  for (const code of pixelStr.match(/[0-9a-f]+/g)!) {
    const col = parseInt(code)

    if (col > 0) {
      const key = `${x},${y}`
      spots[key] = colors[col - 1]
    }

    if (++x === width) x = 0, y++
  }

  $size.value = { w: width, h: y }
}



const undoStack: (() => void)[] = []
const redoStack: (() => void)[] = []

function undo() {

}

function redo() {

}
