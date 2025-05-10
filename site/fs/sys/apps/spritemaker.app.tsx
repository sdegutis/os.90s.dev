import api, { $, Button, Grid, GroupY, Label, Ref, View } from '/os/api.js'
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

type Choice = Readonly<{ [pal in PaletteName]: number } & { current: PaletteName }>

const $choice = $<Choice>({ current: 'sweet24', sweet24: 0, vinik24: 0 })
const $color = $choice.adapt(ch => palettes[ch.current][ch[ch.current]])

$color.watch(c => console.log(c))

const panel = await api.sys.makePanel({ name: "sprite maker" },
  <panel size={{ w: 120, h: 70 }}>
    <api.Center>
      <GroupY>
        <PalettePicker palettes={palettes} $choice={$choice} />
        <ColorPicker palettes={palettes} $choice={$choice} />
      </GroupY>
    </api.Center>
  </panel>
)

panel.focusPanel()

function PalettePicker(data: { palettes: Palette, $choice: Ref<Choice> }) {
  return <GroupY>
    {Object.keys(data.palettes).map(pal => {
      return <Button
        padding={1}
        left={2}
        selected={data.$choice.adapt(ch => ch.current === pal)}
        onClick={() => data.$choice.$ = {
          ...data.$choice.$,
          current: pal as PaletteName,
        }}
      >
        <Label text={pal} />
      </Button>
    })}
  </GroupY>
}

function ColorPicker(data: { palettes: Palette, $choice: Ref<Choice> }) {
  return <Grid cols={4} flow xgap={-1} ygap={-1}>
    {data.$choice.adapt(ch => {
      return data.palettes[ch.current].map((col, coli) => {
        return <Button
          padding={1}
          hoverBackground={0xffffff77}
          selectedBackground={0xffffffff}
          selected={ch[ch.current] === coli}
          onClick={() => data.$choice.$ = {
            ...data.$choice.$,
            [data.$choice.$.current]: coli,
          }}
        >
          <View size={{ w: 7, h: 7 }} background={col} />
        </Button>
      })
    })}
  </Grid>
}
