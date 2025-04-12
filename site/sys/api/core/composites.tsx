import { ButtonComp } from "../composites/button.js"
import { FilePanelComp } from "../composites/filepanel.js"
import { ImplicitComp } from "../composites/implicit.js"
import { PanelBody, PanelResizer, PanelTitlebar, PanelView } from "../composites/panel.js"
import { TextFieldComp } from "../composites/textfield.js"

export const composites: Record<string, Composite<any>> = Object.create(null)

export type Composite<T extends Record<string, any>> = (data: T) => JSX.Element

composites['button'] = ButtonComp
composites['implicit'] = ImplicitComp
composites['textfield'] = TextFieldComp
composites['filepanel'] = FilePanelComp
composites['panel'] = PanelView
composites['panel-resizer'] = PanelResizer
composites['panel-body'] = PanelBody
composites['panel-titlebar'] = PanelTitlebar
