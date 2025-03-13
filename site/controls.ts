
export class View {

  x = 0
  y = 0

  w = 'hi'

  children?: View[] | View

  constructor(config: Partial<View>) {
    // this.x = config.x ?? this.x
    // this.children = ''
  }

}

export const controls = {

  View

}
