export function ontick(fn: (d: number) => void, fps = 30) {
  let done: number
  let last = performance.now();

  (function tick(now: number) {

    const delta = now - last
    if (delta + 1 >= 1000 / fps) {
      last = now
      fn(delta)
    }

    done = requestAnimationFrame(tick)
  })(last)

  return () => cancelAnimationFrame(done)
}
