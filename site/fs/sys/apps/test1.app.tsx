import api from '/api.js'
await api.appReady

api.sys.onIpc.watch(port => {
  console.log('received', port)
})

const panel = await api.sys.makePanel({ name: "test 1" },
  <panel size={{ w: 70, h: 50 }}>
    <api.Margin padding={3}>
      <api.Margin
        padding={1}
        paddingColor={0xffffff11}
        background={0x99000099}
      >
        <api.Scroll background={0x00009999}>
          <api.Margin
            canMouse
            onMouseDown={function (b) {
              this.onMouseUp = api.debounce(api.dragResize(api.sys.$mouse, this.$size))
            }}
            padding={1}
            paddingColor={0xffffff11}
            // point={{ x: 10, y: 10 }}
            size={{ w: 50, h: 50 }}
            background={0x00990099}
          />
        </api.Scroll>
      </api.Margin>
    </api.Margin>
  </panel>
)

panel.focusPanel()
