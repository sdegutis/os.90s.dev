
export class View {

  x = 0
  y = 0
  w = 0
  h = 0

  children?: JSX.Element[] | JSX.Element

  constructor(config: Partial<View>) {
    // Object.assign(this, config)
    // this.x = config.x ?? this.x
    // this.children = ''
  }

}

export class Border extends View {

  padding = 0

  constructor(config: Partial<Border>) {
    super(config)
  }

}

export class Label extends View {

  text = ''

  constructor(config: Partial<Border>) {
    super(config)
  }

}

export const controls = {

  View,
  Border,
  Label,

}
