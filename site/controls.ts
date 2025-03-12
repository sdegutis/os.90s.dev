
export class View {

  x: number
  y?: number

  children?: string

  constructor(config: View) {
    this.x = config.x
    this.children = ''
  }

}

export const controls = {

  view: View

}
