import { button } from "../components/button.js"
import { implicit } from "../components/implicit.js"
import { textfield } from "../components/textfield.js"

export const components: Record<string, Component<any>> = Object.create(null)
export type Component<T extends Record<string, any>> = (data: T) => JSX.Element

components['button'] = button
components['implicit'] = implicit
components['textfield'] = textfield
