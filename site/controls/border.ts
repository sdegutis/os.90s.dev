import { View } from "./view.js"

export class Border extends View {

  constructor(data?: Partial<Border>) {
    super(data)
    Object.assign(this, data)
  }

  padding = 0

}
