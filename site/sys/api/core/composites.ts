import { ButtonComp } from "../composites/button.js"
import { ImplicitComp } from "../composites/implicit.js"
import { PanelBodyComp, PanelResizerComp, PanelTitlebarComp, PanelViewComp } from "../composites/panel.js"
import { TextFieldComp } from "../composites/textfield.js"

export const composites: Record<string, Composite<any>> = Object.create(null)

export type Composite<T extends Record<string, any>> = (data: T) => JSX.Element

composites['button'] = ButtonComp
composites['implicit'] = ImplicitComp
composites['textfield'] = TextFieldComp
composites['panel'] = PanelViewComp
composites['panel-resizer'] = PanelResizerComp
composites['panel-body'] = PanelBodyComp
composites['panel-titlebar'] = PanelTitlebarComp
