import { ButtonComp } from "../components/button.js"
import { FilePanelComp } from "../components/filepanel.js"
import { ImplicitComp } from "../components/implicit.js"
import { PanelBody, PanelResizer, PanelTitlebar, PanelView } from "../components/panel.js"
import { TextFieldComp } from "../components/textfield.js"

export const components: Record<string, Component<any>> = Object.create(null)

export type Component<T extends Record<string, any>> = (data: T) => JSX.Element

components['button'] = ButtonComp
components['implicit'] = ImplicitComp
components['textfield'] = TextFieldComp
components['filepanel'] = FilePanelComp
components['panel'] = PanelView
components['panel-resizer'] = PanelResizer
components['panel-body'] = PanelBody
components['panel-titlebar'] = PanelTitlebar
