export async function opendb<T>(dbname: string, keyPath: keyof T & string) {
  const db = await new Promise<IDBDatabase>(resolve => {
    const r = self.indexedDB.open(dbname, 1)
    r.onupgradeneeded = () => { r.result.createObjectStore('kvs', { keyPath }) }
    r.onsuccess = () => { resolve(r.result) }
  })

  async function run<U>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<U>) {
    const p = Promise.withResolvers<U>()
    const t = db.transaction('kvs', mode)
    const r = fn(t.objectStore('kvs'))
    r.onsuccess = () => p.resolve(r.result)
    return p.promise
  }

  return {
    all: async () => run<T[]>('readonly', store => store.getAll()),
    set: async (val: T) => run('readwrite', store => store.put(val)),
    get: async (key: string) => run<T | undefined>('readonly', store => store.get(key)),
    del: async (key: string) => run('readwrite', store => store.delete(key)),
    end: () => db.close(),
  }
}
