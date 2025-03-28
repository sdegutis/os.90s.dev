const font = $(sys.font)

const filepath = $(program.opts["file"])
if (filepath.val) {
  const fontstr = await sys.getfile(filepath.val)
  if (fontstr) {
    font.val = new Font(fontstr)
  }
}

const SAMPLE_TEXT = [
  "how quickly daft jumping zebras vex!",
  "the five boxing wizards jump quickly.",
  "the quick brown fox, jumps over the lazy dog.",
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789 (){}[]<>",
  `.,'!?-+/":;%*=_&#|\`$@~^\\`,
].join('\n')

const width = $(font.val.cw)
const height = $(font.val.ch)
const zoom = $(2)
const current = $(' ')

const zoommin = 1
const zoommax = 12
zoom.intercept(n => Math.max(zoommin, Math.min(n, zoommax)))

const CHARSET = Array(96).keys().map(i => String.fromCharCode(i + 32)).toArray()
const sheet: Record<string, boolean>[] = []

for (let i = 0; i < CHARSET.length; i++) {
  const spots: Record<string, boolean> = Object.create(null)
  sheet[i] = spots

  const sy = Math.floor(i / 16) * width.val * 16 * height.val
  const sx = (i % 16) * width.val

  for (let y = 0; y < height.val; y++) {
    for (let x = 0; x < width.val; x++) {
      const oy = y * width.val * 16
      spots[`${x},${y}`] = font.val.spr.pixels[(sy + oy) + sx + x] === 1
    }
  }
}



let fontsrc = ''
rebuildNow()
const rebuild = debounce(rebuildNow)

function rebuildNow() {
  fontsrc = `#ffffffff\n\n`

  const grid: boolean[] = []

  for (let i = 0; i < 16 * 6; i++) {
    const char = sheet[i]

    const sy = Math.floor(i / 16) * width.val * 16 * height.val
    const sx = (i % 16) * width.val

    for (let y = 0; y < height.val; y++) {
      for (let x = 0; x < width.val; x++) {
        const oy = y * width.val * 16
        const on = char[`${x},${y}`]
        grid[(sy + oy) + sx + x] = on
      }
    }
  }

  const row = width.val * 16
  for (let i = 0; i < 16 * 6 * width.val * height.val; i++) {
    fontsrc += grid[i] ? '1' : '0'
    fontsrc += i % row === row - 1 ? '\n' : ' '
  }

  font.val = new Font(fontsrc)
}


const panel = await Panel.create(
  <FilePanelView filedata={() => fontsrc} filepath={filepath} title={$('font maker')} size={$({ w: 240, h: 140 })}>
    <PanedYB>
      <Scroll draw={makeStripeDrawer()} background={0xffffff11}>
        <Border padding={zoom}>
          <Grid xgap={zoom} ygap={zoom} cols={16} children={CHARSET.map((ch, index) =>
            <CharView
              spots={sheet[index]}
              drew={spots => {
                sheet[index] = spots
                rebuild()
              }}
              char={ch}
              zoom={zoom}
              width={width}
              height={height}
              hover={ch => current.val = ch}
            />
          )} />
        </Border>
      </Scroll>
      <Border padding={2} canMouse onWheel={(x, y) => zoom.val += -y / 100}>
        <GroupY align='a' gap={4}>
          <Textarea autofocus font={font} text={'sample text goes here (you can type in it)'} />
          <Label text={SAMPLE_TEXT} font={font} />
          <GroupX gap={7}>
            <GroupX gap={2}>
              <Label textColor={0xffffff33} text='width' />
              <Label textColor={0xffff00cc} text={width.adapt(n => n.toString().padStart(2, ' '))} />
              <Slider val={width} min={1} max={12} />
            </GroupX>
            <GroupX gap={2}>
              <Label textColor={0xffffff33} text='height' />
              <Label textColor={0xffff00cc} text={height.adapt(n => n.toString().padStart(2, ' '))} />
              <Slider val={height} min={1} max={12} />
            </GroupX>
            <GroupX gap={2}>
              <Label textColor={0xffffff33} text='zoom' />
              <Label textColor={0xffff00cc} text={zoom.adapt(n => n.toString().padStart(2, ' '))} />
              <Slider val={zoom} min={zoommin} max={zoommax} />
            </GroupX>
            <GroupX gap={2}>
              <Label textColor={0xffffff33} text='hover' />
              <Label textColor={0xffff00cc} text={current} />
            </GroupX>
          </GroupX>
        </GroupY>
      </Border>
    </PanedYB>
  </FilePanelView>
)

function Slider({ val, min, max }: { val: Ref<number>, min: number, max: number }) {
  const w = 30
  const kw = 4

  const knobImage = new Bitmap([0xffffff99], kw, [
    0, 1, 1, 0,
    1, 1, 1, 1,
    1, 1, 1, 1,
    0, 1, 1, 0,
  ])

  const $per = val.adapt(val => (val - min) / (max - min))
  $per.intercept(per => Math.max(0, Math.min(per, 1)))
  $per.watch(per => val.val = Math.round(per * (max - min) + min))

  const knob = <ImageView bitmap={knobImage} point={$per.adapt(per => ({ x: Math.round(per * (w - kw)), y: 0 }))} />

  const onMouseDown = function (this: View): void {
    const $movepoint = $(knob.point)
    $movepoint.watch(p => $per.val = p.x / (w - kw))
    this.onMouseUp = dragMove(this.$.mouse, $movepoint)
  }

  return <View canMouse size={{ w, h: 4 }} onMouseDown={onMouseDown}>
    <View point={{ x: 0, y: 1 }} size={{ w, h: 1 }} background={0xffffff77} />
    {knob}
  </View>
}

function CharView(
  { char, width, height, zoom, hover, drew, spots }: {
    spots: Record<string, boolean>,
    drew: (spots: Record<string, boolean>) => void,
    hover: (ch: string) => void,
    char: string,
    zoom: Ref<number>,
    width: Ref<number>,
    height: Ref<number>,
  }
) {
  const notifyDrew = () => drew(spots)
  notifyDrew()
  width.watch(notifyDrew)
  height.watch(notifyDrew)

  const view = <View
    canMouse
    background={0x00000033}
    onMouseEnter={function () { this.panel?.pushCursor(Cursor.NONE); hover(char) }}
    onMouseExit={function () { this.panel?.popCursor(Cursor.NONE) }}
    size={multiplex([width, height, zoom], () => ({
      w: width.val * zoom.val,
      h: height.val * zoom.val,
    }))}
  />

  const $spot = multiplex([view.$.mouse, zoom], () => {
    const x = Math.floor(view.mouse.x / zoom.val)
    const y = Math.floor(view.mouse.y / zoom.val)
    return { x, y }
  })
  $spot.equals = pointEquals

  const $key = $spot.adapt(s => `${s.x},${s.y}`)

  view.$.hovered.watch(() => view.needsRedraw())
  $spot.watch(() => view.needsRedraw())

  view.onMouseDown = function (b) {
    const on = b === 0
    const draw = () => {
      spots[$key.val] = on
      notifyDrew()
    }
    draw()
    this.onMouseUp = $key.watch(draw)
  }

  view.draw = function (ctx, px, py) {
    View.prototype.draw.call(this, ctx, px, py)

    for (let x = 0; x < width.val; x++) {
      for (let y = 0; y < height.val; y++) {
        const key = `${x},${y}`
        const on = spots[key]
        if (on) {
          ctx.fillRect(
            px + x * zoom.val,
            py + y * zoom.val,
            zoom.val,
            zoom.val,
            0xffffffff
          )
        }
      }
    }

    if (this.hovered) {
      ctx.fillRect(px + $spot.val.x * zoom.val, py + $spot.val.y * zoom.val, zoom.val, zoom.val, 0x0000ff99)
    }
  }

  return (
    <Border paddingColor={0xffffff11} padding={1}>
      {view}
    </Border>
  )
}

panel.focusPanel()

function makeStripeDrawer(w = 4, h = 3) {
  return function (this: View, ...[ctx, px, py]: Parameters<View['draw']>) {
    this.drawBackground(ctx, px, py, this.background)

    let off = 0
    for (let y = 0; y < this.size.h; y++) {
      for (let x = 0; x < this.size.w; x += w) {
        ctx.fillRect(px + x + off, py + y, 1, 1, 0xffffff04)
      }
      if (y % h === (h - 1)) off = (off + 1) % w
    }
  }
}
