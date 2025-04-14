export async function runJsFile(path: string, decache = true) {
  path = '/fs/' + path
  if (decache) path += '?decache=' + Date.now()
  return await import(path)
}
