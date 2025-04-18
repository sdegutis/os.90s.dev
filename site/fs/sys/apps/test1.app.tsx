import * as api from '/api.js'
await api.appReady


const panel = await api.sys.makePanel({ name: "test 1" },
  <panel size={{ w: 70, h: 50 }}>
    <api.Margin padding={3}>
      <api.Border
        padding={1}
        paddingColor={0xffffff11}
        background={0x99000099}
        layout={() => { }}
      >
        <api.Margin
          canMouse
          onMouseDown={function (b) {
            const m = this.panel!.$mouse
            const done = b
              ? api.debounce(api.dragResize(m, this.$size))
              : api.debounce(api.dragMove(m, this.$point))
            this.onMouseUp = done
          }}
          padding={1}
          paddingColor={0xffffff11}
          point={{ x: 10, y: 10 }}
          size={{ w: 50, h: 50 }}
          background={0x00990099}
        />
      </api.Border>
    </api.Margin>
  </panel>
)

panel.focusPanel()
