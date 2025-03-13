import { View } from "./view.js"

export class Label extends View {

  constructor(data?: Partial<Label>) {
    super(data)
    Object.assign(this, data)
  }

  text = ''

}
