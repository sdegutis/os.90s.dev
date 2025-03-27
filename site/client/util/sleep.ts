export async function sleep(sec: number) {
  return new Promise(r => setTimeout(r, sec * 1000))
}
