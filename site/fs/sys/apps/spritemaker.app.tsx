import api, { $, Button, Grid, GroupY, Label, multiplex, View } from '/os/api.js'
await api.preludesFinished

export type Color = { p: keyof typeof palettes, i: number }

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

const $pal = $<keyof typeof palettes>('sweet24')
const $i = $(0)
const $color = multiplex([$pal, $i], (pal, i) => pal[i])

const panel = await api.sys.makePanel({ name: "sprite maker" },
  <panel size={{ w: 120, h: 70 }}>
    <api.Center>
      <GroupY>
        <PalettePicker />
        <ColorPicker />
      </GroupY>
    </api.Center>
  </panel>
)

panel.focusPanel()

function PalettePicker() {
  return <GroupY>
    {Object.keys(palettes).map(pal => {
      return <Button
        padding={2}
        selected={$pal.adapt(p => p === pal)}
        onClick={() => $pal.$ = pal as keyof typeof palettes}
      >
        <Label text={pal} />
      </Button>
    })}
  </GroupY>
}

function ColorPicker() {
  return <Grid cols={4} flow xgap={-1} ygap={-1}>
    {$pal.adapt(pal => {
      return palettes[pal].map((col, coli) => {
        return <Button
          padding={1}
          hoverBackground={0xffffff77}
          selectedBackground={0xffffffff}
          selected={$i.adapt(i => i === coli)}
          onClick={() => $i.$ = coli}
        >
          <View size={{ w: 7, h: 7 }} background={col} />
        </Button>
      })
    })}
  </Grid>
}
