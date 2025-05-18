import { composites } from "../core/composites.js"
import { $, Ref } from "../core/ref.js"
import { Button } from "../views/button.js"
import { Grid } from "../views/grid.js"
import { GroupY } from "../views/group.js"
import { Label } from "../views/label.js"
import { View } from "../views/view.js"

composites["colorpicker"] = ColorView

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'colorpicker': Parameters<typeof ColorView>[0]
    }
  }
}

function ColorView(data: { $color: Ref<number> }) {

  type Palette = keyof typeof palettes

  type ColorSel = Readonly<{
    palette: Palette,
    choices: Record<Palette, number>,
  }>

  const palettes = {

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

  const $colorsel = $<ColorSel>({
    palette: 'sweet24',
    choices: { sweet24: 0, vinik24: 0 },
  })

  data.$color.defer($colorsel.adapt(ch => {
    const i = ch.choices[ch.palette]
    const pal = palettes[ch.palette]
    return pal[i]
  }))

  function PalettePicker() {
    return <GroupY>
      {Object.keys(palettes).map(pal => {
        return <Button
          padding={1}
          left={2}
          selected={$colorsel.adapt(ch => ch.palette === pal)}
          onClick={() => {
            $colorsel.set({
              ...$colorsel.val,
              palette: pal as Palette,
            })
          }}
        >
          <Label text={pal} />
        </Button>
      })}
    </GroupY>
  }

  function ColorPicker() {
    return <Grid cols={4} xgap={-1} ygap={-1}>
      {$colorsel.adapt(ch => {
        return palettes[ch.palette].map((col, coli) => {
          return <Button
            padding={1}
            hoverBackground={0xffffff77}
            selectedBackground={0xffffffff}
            selected={ch.choices[ch.palette] === coli}
            onClick={() => {
              $colorsel.set({
                ...$colorsel.val,
                choices: {
                  ...ch.choices,
                  [ch.palette]: coli,
                },
              })
            }}
          >
            <View size={{ w: 7, h: 7 }} background={col} />
          </Button>
        })
      })}
    </Grid>
  }

  return <GroupY>
    <PalettePicker />
    <ColorPicker />
  </GroupY>
}
