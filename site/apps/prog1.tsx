import { Program } from "../client/core/prog.js"
import { $ } from "../client/util/ref.js"
import { Bitmap } from "../shared/bitmap.js"

const prog = new Program()
await prog.init()

const mnuImage = new Bitmap([0x333333ff], 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1])

const children = $([
  <button padding={2}><label text={'hey'} /></button>,
  <image bitmap={mnuImage} />,
  <textarea w={20} h={20} />,
  ...Array(20).keys().map(i => <label text={`view ${i.toString()}`} />)
])

const panel = await prog.makePanel({
  size: [100, 100],
  view:
    <panedya background={0x00330099}>
      <label text={'yep'} background={0x33000099} />
      <splitx pos={50} min={10} max={-10} background={0x000033dd}>
        <scroll background={0x00770099}>
          <border background={0x00009999} padding={2}>
            <groupy gap={2} align={'a'}>
              {children}
            </groupy>
          </border>
        </scroll>
        <border padding={3} background={0x99000099}>
          <border padding={3} background={0x00009999}>
            <groupy gap={2} background={0x00003399}>
              <label text={'one'} />
              <label text={'two'} />
            </groupy>
          </border>
        </border>
      </splitx>
    </panedya>
  ,
  // view: <PanelView title={'test panel'}>
  //   <panedya background={0x00330099}>
  //     <label text={'yep'} background={0x33000099} />
  //     <splitx pos={50} min={10} max={-10}>
  //       <scroll background={0x00330099}>
  //         <border background={0x00009999} padding={2}>
  //           <groupy gap={2} align={'a'}>
  //             {children}
  //           </groupy>
  //         </border>
  //       </scroll>
  //       <border padding={3} background={0x99000099}>
  //         <border padding={3} background={0x00009999}>
  //           <groupy gap={2} background={0x00003399}>
  //             <label text={'one'} />
  //             <label text={'two'} />
  //           </groupy>
  //         </border>
  //       </border>
  //     </splitx>
  //   </panedya>
  // </PanelView>,
})
