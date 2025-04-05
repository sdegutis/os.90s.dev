export const debounce = <T extends (...args: any) => any>(fn: T) => {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args))
  }
}
