import * as api from "/api.js"
await api.appReady

let content = ''
const $filepath = api.$<string>(api.program.opts["file"] ?? '')
if ($filepath.val) content = await api.fs.getFile($filepath.val) ?? ''

const model = new api.TextModel(content)

const hl = new api.Highlighter(api.langThemes.ftfTheme1, api.langGrammars.ftfGrammar)
model.highlighter = hl
// hl.log = true
hl.highlight(model, 0)

const pathModel = new api.TextModel($filepath.val)

function changePath() {

}

const panel = await api.sys.makePanel({ name: "readftf" },
  <panel title='readftf' size={{ w: 100, h: 70 }}>
    <api.PanedYA>

      <api.GroupX>
        <api.Button padding={2}><api.Label text='<' /></api.Button>
        <api.Button padding={2}><api.Label text='>' /></api.Button>
        <api.Border padding={2}>
          <api.TextBox onEnter={changePath} model={pathModel} />
        </api.Border>
      </api.GroupX>

      <api.Scroll
        background={0xffffff11}
        onMouseDown={function (b) { this.content.onMouseDown?.(b) }}
        onMouseMove={function (p) { this.content.onMouseMove?.(p) }}
        onMouseUp={function () { this.content.onMouseUp?.() }}
      >
        <api.Border padding={4}
          onMouseDown={function (b) { this.firstChild!.onMouseDown?.(b) }}
          onMouseMove={function (p) { this.firstChild!.onMouseMove?.(p) }}
          onMouseUp={function () { this.firstChild!.onMouseUp?.() }}
        >
          <api.TextBox editable={false} model={model} cursorColor={0x99000099} />
        </api.Border>
      </api.Scroll>

    </api.PanedYA>
  </panel>
)

panel.focusPanel()
