function view() {
  return {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    background: 0x00000000,
    children: undefined as JSX.Element[] | JSX.Element | undefined,
  }
}

function border() {
  return {
    ...view(),
    padding: 0,
  }
}

export const primitives = {
  view,
  border,
}
