import { Program } from "../client/core/prog.js"
import { PanelView } from "../client/util/panelview.js"

const prog = new Program()
await prog.init()

const panel = await prog.makePanel({
  size: [100, 100],
  view: <PanelView title={'test panel'}>
    <textarea background={0x00330099} text={'asdf'} />
  </PanelView>,
})
