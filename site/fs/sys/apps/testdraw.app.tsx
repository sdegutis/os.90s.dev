import * as api from "/api.js"
await api.appReady

const rint = (min: number, max: number) => Math.round(Math.random() * (max - min)) + min

class MyView extends api.View {

  override init(): void {
    super.init()

    api.ontick((d) => {
      console.log(d)
      this.needsRedraw()
    }, 60)
  }

  override draw(ctx: api.DrawingContext): void {

    for (let i = 0; i < 10000; i++) {
      const x = rint(0, this.size.w / 2)
      const w = rint(10, this.size.w / 2)
      const y = rint(0, this.size.h / 2)
      const h = rint(10, this.size.h / 2)
      const c = Math.floor(Math.random() * 0xffffffff)
      ctx.fillRect(x, y, w, h, c)
    }
  }

}

const panel = await api.sys.makePanel({ name: "testdraw" },
  <panel size={{ w: 100, h: 70 }}>
    <api.Center>
      <button action={function (this: api.View) {
        const contentView = this.parent!.parent!
        contentView.children = [<MyView />]
      }}>begin strobe rect test</button>
    </api.Center>
  </panel>
)

panel.focusPanel()
