declare namespace JSX {

  type C = typeof import('./controls.ts').controls
  type IntrinsicElements = { [K in keyof C as Lowercase<K>]: Partial<InstanceType<C[K]>> }
  type ElementChildrenAttribute = { children: any }

  type Element = {
    [jsx: symbol]: any,
    [attr: string]: any,
    children?: any,
  }

}
