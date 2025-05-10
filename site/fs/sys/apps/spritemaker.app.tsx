import api, { $, Button, Grid, GroupY, Label, multiplex, Ref, View } from '/os/api.js'
await api.preludesFinished

type Palette = typeof palettes
type PaletteName = keyof Palette

export const palettes = {

  vinik24: [
    0x000000ff, 0x6f6776ff, 0x9a9a97ff, 0xc5ccb8ff, 0x8b5580ff, 0xc38890ff,
    0xa593a5ff, 0x666092ff, 0x9a4f50ff, 0xc28d75ff, 0x7ca1c0ff, 0x416aa3ff,
    0x8d6268ff, 0xbe955cff, 0x68aca9ff, 0x387080ff, 0x6e6962ff, 0x93a167ff,
    0x6eaa78ff, 0x557064ff, 0x9d9f7fff, 0x7e9e99ff, 0x5d6872ff, 0x433455ff,
  ],

  sweet24: [
    0x2c4941ff, 0x66a650ff, 0xb9d850ff, 0x82dcd7ff, 0x208cb2ff, 0x253348ff,
    0x1d1b24ff, 0x3a3a41ff, 0x7a7576ff, 0xb59a66ff, 0xcec7b1ff, 0xedefe2ff,
    0xd78b98ff, 0xa13d77ff, 0x6d2047ff, 0x3c1c43ff, 0x2c2228ff, 0x5e3735ff,
    0x885a44ff, 0xb8560fff, 0xdc9824ff, 0xefcb84ff, 0xe68556ff, 0xc02931ff,
  ],

}

const $pal = $<PaletteName>('sweet24')
const $i = $(0)
const $color = multiplex([$pal, $i], (pal, i) => pal[i])

const panel = await api.sys.makePanel({ name: "sprite maker" },
  <panel size={{ w: 120, h: 70 }}>
    <api.Center>
      <GroupY>
        <PalettePicker palettes={palettes} $pal={$pal} />
        <ColorPicker palettes={palettes} $pal={$pal} $i={$i} />
      </GroupY>
    </api.Center>
  </panel>
)

panel.focusPanel()

function PalettePicker(data: { palettes: Palette, $pal: Ref<PaletteName> }) {
  return <GroupY>
    {Object.keys(data.palettes).map(pal => {
      return <Button
        padding={2}
        selected={data.$pal.adapt(p => p === pal)}
        onClick={() => data.$pal.$ = pal as PaletteName}
      >
        <Label text={pal} />
      </Button>
    })}
  </GroupY>
}

function ColorPicker(data: { palettes: Palette, $pal: Ref<PaletteName>, $i: Ref<number> }) {
  return <Grid cols={4} flow xgap={-1} ygap={-1}>
    {data.$pal.adapt(pal => {
      return data.palettes[pal].map((col, coli) => {
        return <Button
          padding={1}
          hoverBackground={0xffffff77}
          selectedBackground={0xffffffff}
          selected={data.$i.adapt(i => i === coli)}
          onClick={() => data.$i.$ = coli}
        >
          <View size={{ w: 7, h: 7 }} background={col} />
        </Button>
      })
    })}
  </Grid>
}
