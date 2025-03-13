
export class View {

  x = 0
  y = 0

  w = 'hi'

  children?: JSX.Element[] | JSX.Element

  constructor(config: Partial<View>) {
    // this.x = config.x ?? this.x
    // this.children = ''
  }

}

export const controls = {

  View

}
