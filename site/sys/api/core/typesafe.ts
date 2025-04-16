export function as<T>(o: any, fn: string, as: (o: any) => T | undefined) {
  try {
    const v = new Function('o', `return o.${fn}`)(o)
    return as(v) as T | undefined
  }
  catch (e) {
    return undefined
  }
}

as.number = (o: any) => (typeof o === 'number' ? o : undefined)
as.string = (o: any) => (typeof o === 'string' ? o : undefined)
as.boolean = (o: any) => (typeof o === 'boolean' ? o : undefined)
as.numbers = (o: any) => (o instanceof Array && o.every(c => typeof c === 'number') ? o : undefined)
as.strings = (o: any) => (o instanceof Array && o.every(c => typeof c === 'string') ? o : undefined)
