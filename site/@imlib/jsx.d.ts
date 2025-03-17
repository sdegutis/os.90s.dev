declare namespace JSX {

  type IntrinsicElements =
    & { [K in keyof HTMLElementTagNameMap]: { [A in keyof HTMLElementTagNameMap[K]as Lowercase<A & string>]?: string } }
    & { [K in keyof SVGElementTagNameMap]: Record<string, string> }

  type Element = string

}
