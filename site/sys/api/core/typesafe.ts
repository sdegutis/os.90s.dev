export const typesafe = {
  number: (o: any) => (typeof o === 'number' ? o : undefined),
  string: (o: any) => (typeof o === 'string' ? o : undefined),
  boolean: (o: any) => (typeof o === 'boolean' ? o : undefined),
  numbers: (o: any) => (o instanceof Array && o.every(c => typeof c === 'number') ? o : undefined),
  strings: (o: any) => (o instanceof Array && o.every(c => typeof c === 'string') ? o : undefined),
}

export function as<K extends keyof typeof typesafe>(o: any, fn: string, as: K) {
  const c = typesafe[as]
  try {
    const v = new Function('o', `return o.${fn}`)(o)
    return c(v) as ReturnType<typeof typesafe[K]>
  }
  catch (e) {
    return undefined
  }
}
