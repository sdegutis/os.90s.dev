import * as api from "/api.js"

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

const panel = await api.Panel.create({ name: "testdraw" },
  <api.PanelView title={api.$('test draw')} size={api.$({ w: 100, h: 70 })}>
    <MyView />
  </api.PanelView>
)

panel.focusPanel()
