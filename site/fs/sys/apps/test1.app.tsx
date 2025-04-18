import * as api from '/api.js'
await api.appReady


const panel = await api.sys.makePanel({ name: "test 1" },
  <panel size={{ w: 70, h: 50 }}>
    <api.Margin name='a' padding={3}>
      <api.Margin name='b'
        padding={1}
        paddingColor={0xffffff11}
        background={0x99000099}
        layout={() => { }}
      >
        <api.Margin name='c'
          canMouse
          onMouseDown={function (b) {
            this.onMouseUp = b
              ? api.debounce(api.dragResize(api.sys.$mouse, this.$size))
              : api.debounce(api.dragMove(api.sys.$mouse, this.$point))
          }}
          padding={1}
          paddingColor={0xffffff11}
          point={{ x: 10, y: 10 }}
          size={{ w: 50, h: 50 }}
          background={0x00990099}
        />
      </api.Margin>
    </api.Margin>
  </panel>
)

panel.focusPanel()
